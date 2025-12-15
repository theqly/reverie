package processor

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	ev "github.com/theqly/reverie/backend/kafka-module/events/v1"
	"github.com/theqly/reverie/backend/lamifare/internal/kafka"
	"github.com/theqly/reverie/backend/lamifare/internal/opensearch"
	"go.uber.org/zap"
)

type Processor struct {
	opensearchClient *opensearch.Client
	dlqProducer      *kafka.Producer
	log              *zap.Logger
	maxAttempts      int
	baseBackoff      time.Duration
	boardsIndex      string
	pinsIndex        string
	usersIndex       string
}

type dlqPayload struct {
	Topic      string                 `json:"topic"`
	Key        string                 `json:"key,omitempty"`
	Value      json.RawMessage        `json:"value"`
	Error      string                 `json:"error"`
	OccurredAt time.Time              `json:"occurred_at"`
	Meta       map[string]interface{} `json:"meta,omitempty"`
}

func New(opensearchClient *opensearch.Client, dlqProducer *kafka.Producer, logger *zap.Logger) *Processor {
	return &Processor{
		opensearchClient: opensearchClient,
		dlqProducer:      dlqProducer,
		log:              logger,
		maxAttempts:      5,
		baseBackoff:      300 * time.Millisecond,
		boardsIndex:      "boards",
		pinsIndex:        "pins",
		usersIndex:       "users",
	}
}

func (p *Processor) Process(ctx context.Context, topic string, key []byte, value []byte) error {
	// try to detect event type quickly by peeking into JSON
	var base struct {
		EventType  string     `json:"event_type"`
		OccurredAt *time.Time `json:"occurred_at"`
	}
	if err := json.Unmarshal(value, &base); err != nil {
		// если даже base не распарсить -> DLQ
		p.log.Error("malformed base event", zap.Error(err))
		_ = p.publishToDLQ(ctx, topic, key, value, fmt.Sprintf("malformed base event: %v", err), nil)
		return nil
	}

	// Determine event kind:
	// prefer base.EventType if producer sets it, otherwise fall back to topic name
	eventKind := base.EventType
	if eventKind == "" {
		eventKind = topic // producers publish to specific topics like "pin.created"
	}

	// We'll attempt processing with retry on transient errors.
	var lastErr error
	backoff := p.baseBackoff
	for attempt := 1; attempt <= p.maxAttempts; attempt++ {
		if attempt > 1 {
			// backoff before retry
			select {
			case <-ctx.Done():
				return ctx.Err()
			case <-time.After(backoff):
			}
			backoff *= 2
		}

		// dispatch
		err := p.dispatch(ctx, eventKind, topic, key, value)
		if err == nil {
			// success
			return nil
		}

		// check if error is fatal (malformed etc). We will classify by type.
		if errors.Is(err, errMalformed) {
			// already DLQ'd inside dispatch or should be DLQ'd now
			p.log.Error("malformed event (fatal) - sent to DLQ", zap.Error(err), zap.String("topic", topic))
			_ = p.publishToDLQ(ctx, topic, key, value, err.Error(), map[string]interface{}{"attempt": attempt})
			return nil
		}

		// transient error -> keep retrying
		lastErr = err
		p.log.Warn("processing attempt failed, will retry", zap.Int("attempt", attempt), zap.Error(err), zap.String("topic", topic))
	}

	// After retries, if still failing -> send to DLQ to avoid poisoning the topic
	p.log.Error("processing failed after retries, sending to DLQ", zap.Error(lastErr), zap.String("topic", topic))
	if err := p.publishToDLQ(ctx, topic, key, value, fmt.Sprintf("processing failed after %d attempts: %v", p.maxAttempts, lastErr), nil); err != nil {
		// if DLQ publish itself fails - log it (we cannot do much else here)
		p.log.Error("failed to publish to DLQ", zap.Error(err))
	}
	return nil
}

var errMalformed = errors.New("malformed event or unsupported event type")

// dispatch does the actual parsing and calls ES client.
// returns errMalformed for unrecoverable parsing/validation errors (so caller knows to DLQ immediately).
func (p *Processor) dispatch(ctx context.Context, eventKind, topic string, key []byte, value []byte) error {
	switch eventKind {
	// PINS
	case "pin.created", "pin.created.v1", "pin.created.v2":
		var e ev.PinCreated
		if err := json.Unmarshal(value, &e); err != nil {
			p.log.Error("bad pin.created payload", zap.Error(err))
			return errMalformed
		}
		return p.handlePinCreated(ctx, &e)

	case "pin.updated", "pin.updated.v1":
		var e ev.PinUpdated
		if err := json.Unmarshal(value, &e); err != nil {
			p.log.Error("bad pin.updated payload", zap.Error(err))
			return errMalformed
		}
		return p.handlePinUpdated(ctx, &e)

	case "pin.deleted", "pin.deleted.v1":
		var e ev.PinDeleted
		if err := json.Unmarshal(value, &e); err != nil {
			p.log.Error("bad pin.deleted payload", zap.Error(err))
			return errMalformed
		}
		return p.handlePinDeleted(ctx, &e)

	case "pin.commented":
		var e ev.PinCommented
		if err := json.Unmarshal(value, &e); err != nil {
			p.log.Error("bad pin.commented payload", zap.Error(err))
			return errMalformed
		}
		return p.incrementCounter(ctx, p.pinsIndex, e.PinID, "comments_count", 1)

	case "pin.comment.deleted":
		var e ev.PinCommentDeleted
		if err := json.Unmarshal(value, &e); err != nil {
			p.log.Error("bad pin.comment.deleted payload", zap.Error(err))
			return errMalformed
		}
		return p.incrementCounter(ctx, p.pinsIndex, e.CommentID /* no pin id available? ideally include pin_id in event */, "comments_count", -1)

	case "pin.reaction.added":
		var e ev.PinReactionAdded
		if err := json.Unmarshal(value, &e); err != nil {
			p.log.Error("bad pin.reaction.added payload", zap.Error(err))
			return errMalformed
		}
		return p.incrementCounter(ctx, p.pinsIndex, e.PinID, "reactions_count", 1)

	case "pin.reaction.deleted":
		var e ev.PinReactionDeleted
		if err := json.Unmarshal(value, &e); err != nil {
			p.log.Error("bad pin.reaction.deleted payload", zap.Error(err))
			return errMalformed
		}
		return p.incrementCounter(ctx, p.pinsIndex, e.PinID, "reactions_count", -1)

	case "pin.bookmark.added":
		var e ev.PinBookmarkAdded
		if err := json.Unmarshal(value, &e); err != nil {
			p.log.Error("bad pin.bookmark.added payload", zap.Error(err))
			return errMalformed
		}
		return p.incrementCounter(ctx, p.pinsIndex, e.PinID, "bookmarks_count", 1)

	case "pin.bookmark.deleted":
		var e ev.PinBookmarkDeleted
		if err := json.Unmarshal(value, &e); err != nil {
			p.log.Error("bad pin.bookmark.deleted payload", zap.Error(err))
			return errMalformed
		}
		return p.incrementCounter(ctx, p.pinsIndex, e.PinID, "bookmarks_count", -1)

	// BOARDS - similar to pins
	case "board.created":
		var e ev.BoardCreated
		if err := json.Unmarshal(value, &e); err != nil {
			p.log.Error("bad board.created payload", zap.Error(err))
			return errMalformed
		}
		return p.handleBoardCreated(ctx, &e)

	case "board.updated":
		var e ev.BoardUpdated
		if err := json.Unmarshal(value, &e); err != nil {
			p.log.Error("bad board.updated payload", zap.Error(err))
			return errMalformed
		}
		return p.handleBoardUpdated(ctx, &e)

	case "board.deleted":
		var e ev.BoardDeleted
		if err := json.Unmarshal(value, &e); err != nil {
			p.log.Error("bad board.deleted payload", zap.Error(err))
			return errMalformed
		}
		return p.handleBoardDeleted(ctx, &e)

	case "board.commented":
		var e ev.BoardCommented
		if err := json.Unmarshal(value, &e); err != nil {
			p.log.Error("bad board.commented payload", zap.Error(err))
			return errMalformed
		}
		return p.incrementCounter(ctx, p.boardsIndex, e.BoardID, "comments_count", 1)

	// USERS
	case "user.created":
		var e ev.UserCreated
		if err := json.Unmarshal(value, &e); err != nil {
			p.log.Error("bad user.created payload", zap.Error(err))
			return errMalformed
		}
		return p.handleUserCreated(ctx, &e)

	case "user.updated":
		var e ev.UserUpdated
		if err := json.Unmarshal(value, &e); err != nil {
			p.log.Error("bad user.updated payload", zap.Error(err))
			return errMalformed
		}
		return p.handleUserUpdated(ctx, &e)

	case "user.deleted":
		var e ev.UserDeleted
		if err := json.Unmarshal(value, &e); err != nil {
			p.log.Error("bad user.deleted payload", zap.Error(err))
			return errMalformed
		}
		return p.handleUserDeleted(ctx, &e)

	// Fallback: unknown event type
	default:
		p.log.Warn("unknown event type, sending to DLQ", zap.String("event", eventKind), zap.String("topic", topic))
		_ = p.publishToDLQ(ctx, topic, key, value, "unknown event type", map[string]interface{}{"detected_type": eventKind})
		return nil
	}
}

// ===== Handlers for entity events =====

func (p *Processor) handlePinCreated(ctx context.Context, e *ev.PinCreated) error {
	doc := map[string]interface{}{
		"pin_id":      e.PinID,
		"name":        e.Name,
		"description": e.Description,
		"owner_id":    e.OwnerID,
		"rating":      e.Rating,
		"place_id":    e.PlaceID,
		"created_at":  e.CreatedAt.Format(time.RFC3339),
		"updated_at":  e.OccurredAt.Format(time.RFC3339),
	}
	// location if present
	if e.Latitude != 0 || e.Longitude != 0 {
		doc["location"] = map[string]float64{"lat": e.Latitude, "lon": e.Longitude}
	}
	return p.opensearchClient.Upsert(ctx, p.pinsIndex, e.PinID, doc)
}

func (p *Processor) handlePinUpdated(ctx context.Context, e *ev.PinUpdated) error {
	payload := map[string]interface{}{}
	if e.Name != "" {
		payload["name"] = e.Name
	}
	if e.Description != "" {
		payload["description"] = e.Description
	}
	if e.Latitude != 0 || e.Longitude != 0 {
		payload["location"] = map[string]float64{"lat": e.Latitude, "lon": e.Longitude}
	}
	// always update updated_at with event timestamp
	payload["updated_at"] = e.OccurredAt.Format(time.RFC3339)
	_, err := p.opensearchClient.UpdateIfNewer(ctx, p.pinsIndex, e.PinID, payload, e.OccurredAt.Format(time.RFC3339))
	return err
}

func (p *Processor) handlePinDeleted(ctx context.Context, e *ev.PinDeleted) error {
	return p.opensearchClient.Delete(ctx, p.pinsIndex, e.PinID)
}

func (p *Processor) handleBoardCreated(ctx context.Context, e *ev.BoardCreated) error {
	doc := map[string]interface{}{
		"board_id":   e.BoardID,
		"name":       e.Name,
		"owner_id":   e.OwnerID,
		"access":     e.AccessLevel,
		"created_at": e.CreatedAt.Format(time.RFC3339),
		"updated_at": e.OccurredAt.Format(time.RFC3339),
	}
	if len(e.PinIDs) > 0 {
		doc["pin_ids"] = e.PinIDs
	}
	return p.opensearchClient.Upsert(ctx, p.boardsIndex, e.BoardID, doc)
}

func (p *Processor) handleBoardUpdated(ctx context.Context, e *ev.BoardUpdated) error {
	payload := map[string]interface{}{}
	if e.Name != "" {
		payload["name"] = e.Name
	}
	if e.AccessLevel != "" {
		payload["access"] = e.AccessLevel
	}
	payload["updated_at"] = time.Now().UTC().Format(time.RFC3339)
	_, err := p.opensearchClient.UpdateIfNewer(ctx, p.boardsIndex, e.BoardID, payload, time.Now().UTC().Format(time.RFC3339))
	return err
}

func (p *Processor) handleBoardDeleted(ctx context.Context, e *ev.BoardDeleted) error {
	return p.opensearchClient.Delete(ctx, p.boardsIndex, e.BoardID)
}

func (p *Processor) handleUserCreated(ctx context.Context, e *ev.UserCreated) error {
	doc := map[string]interface{}{
		"user_id":     e.UserID,
		"nickname":    e.Nickname,
		"nick_tag":    e.NickTag,
		"user_rating": e.UserRating,
		"status":      e.Status,
		"created_at":  e.OccurredAt.Format(time.RFC3339),
		"updated_at":  e.OccurredAt.Format(time.RFC3339),
	}
	return p.opensearchClient.Upsert(ctx, p.usersIndex, e.UserID, doc)
}

func (p *Processor) handleUserUpdated(ctx context.Context, e *ev.UserUpdated) error {
	payload := map[string]interface{}{}
	if e.Nickname != "" {
		payload["nickname"] = e.Nickname
	}
	if e.ProfilePicture != "" {
		payload["profile_picture"] = e.ProfilePicture
	}
	if e.Description != "" {
		payload["description"] = e.Description
	}
	if e.UserRating != 0 {
		payload["user_rating"] = e.UserRating
	}
	if e.Status != "" {
		payload["status"] = e.Status
	}
	payload["updated_at"] = e.OccurredAt.Format(time.RFC3339)
	_, err := p.opensearchClient.UpdateIfNewer(ctx, p.usersIndex, e.UserID, payload, e.OccurredAt.Format(time.RFC3339))
	return err
}

func (p *Processor) handleUserDeleted(ctx context.Context, e *ev.UserDeleted) error {
	// recommended: mark as deleted instead of full delete, but we support both.
	payload := map[string]interface{}{
		"status":     "deleted",
		"updated_at": e.OccurredAt.Format(time.RFC3339),
	}
	_, err := p.opensearchClient.UpdateIfNewer(ctx, p.usersIndex, e.UserID, payload, e.OccurredAt.Format(time.RFC3339))
	return err
}

// ===== Helpers =====

// incrementCounter executes an ES script that increments (or decrements) a numeric counter.
// If document does not exist we upsert with initial value = delta.
func (p *Processor) incrementCounter(ctx context.Context, index string, docID string, counterField string, delta int) error {
	// script source: ctx._source[counterField] = ctx._source.get(counterField,0) + params.delta
	script := fmt.Sprintf("if (ctx._source.%s == null) { ctx._source.%s = params.delta } else { ctx._source.%s += params.delta }", counterField, counterField, counterField)
	params := map[string]interface{}{"delta": delta}
	upsert := map[string]interface{}{counterField: delta}
	updated, err := p.opensearchClient.UpdateByScript(ctx, index, docID, script, params, upsert)
	if err != nil {
		return err
	}
	if !updated {
		// noop (rare unless script sets op none) -> nothing to do
	}
	return nil
}

// publishToDLQ marshals a DLQ payload and publishes it to configured DLQ topic using producer.
func (p *Processor) publishToDLQ(ctx context.Context, topic string, key []byte, value []byte, reason string, meta map[string]interface{}) error {
	pl := dlqPayload{
		Topic:      topic,
		Value:      json.RawMessage(value),
		Error:      reason,
		OccurredAt: time.Now().UTC(),
		Meta:       meta,
	}
	if len(key) > 0 {
		pl.Key = string(key)
	}
	b, _ := json.Marshal(pl)
	// publish to configured DLQ topic
	dlqTopic := "pins.dlq"
	if p.dlqProducer == nil {
		p.log.Error("DLQ producer not configured, dropping message", zap.String("reason", reason))
		return errors.New("dlq producer not configured")
	}
	return p.dlqProducer.PublishDLQ(ctx, dlqTopic, []byte(pl.Key), b)
}
