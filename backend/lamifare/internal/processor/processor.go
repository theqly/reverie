package processor

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	events "github.com/theqly/reverie/backend/kafka-module/events/v1"
	"github.com/theqly/reverie/backend/lamifare/internal/kafka"
	"github.com/theqly/reverie/backend/lamifare/internal/opensearch"
	"go.uber.org/zap"
)

type Processor struct {
	osClient    *opensearch.Client
	dlqProd     *kafka.Producer
	log         *zap.Logger
	maxAttempts int
	backoff     time.Duration

	pinsIndex   string
	boardsIndex string
	usersIndex  string
}

func New(osClient *opensearch.Client, dlqProd *kafka.Producer, logger *zap.Logger) *Processor {
	return &Processor{
		osClient:    osClient,
		dlqProd:     dlqProd,
		log:         logger,
		maxAttempts: 5,
		backoff:     300 * time.Millisecond,
		pinsIndex:   "pins",
		boardsIndex: "boards",
		usersIndex:  "users",
	}
}

var errMalformed = errors.New("malformed event or unsupported payload")

func (p *Processor) Process(ctx context.Context, topic string, key []byte, value []byte) error {
	var err error
	for attempt := 1; attempt <= p.maxAttempts; attempt++ {
		if attempt > 1 {
			select {
			case <-ctx.Done():
				return ctx.Err()
			case <-time.After(p.backoff):
			}
		}

		err = p.dispatch(ctx, topic, key, value)

		if err == nil {
			p.log.Info("handled event from topic", zap.String("topic", topic))
			return nil
		}

		if errors.Is(err, errMalformed) {
			break
		}
	}

	p.log.Error("processing failed", zap.String("topic", topic), zap.Error(err))
	if dlqErr := p.dlqProd.PublishDLQ(ctx, topic, key, value, fmt.Sprintf("processing failed after %d attempts: %v", p.maxAttempts, err)); dlqErr != nil {
		return fmt.Errorf("failed to publish to DLQ: %w", dlqErr)
	} // TODO i dont know how to setup dlq and now u will see errors in log
	return nil
}

func (p *Processor) dispatch(ctx context.Context, topic string, key []byte, value []byte) error {
	switch topic {
	// USERS
	case "user.created":
		var e events.UserCreated
		if err := json.Unmarshal(value, &e); err != nil {
			p.log.Error("user.created: unmarshal failed", zap.Error(err))
			return errMalformed
		}
		return p.handleUserCreated(ctx, &e)

	case "user.updated":
		var e events.UserUpdated
		if err := json.Unmarshal(value, &e); err != nil {
			p.log.Error("user.updated: unmarshal failed", zap.Error(err))
			return errMalformed
		}
		return p.handleUserUpdated(ctx, &e)

	case "user.deleted":
		var e events.UserDeleted
		if err := json.Unmarshal(value, &e); err != nil {
			p.log.Error("user.deleted: unmarshal failed", zap.Error(err))
			return errMalformed
		}
		return p.handleUserDeleted(ctx, &e)

	case "follow.created":
		var e events.FollowCreated
		if err := json.Unmarshal(value, &e); err != nil {
			p.log.Error("follow.created: unmarshal failed", zap.Error(err))
			return errMalformed
		}
		return p.handleFollowCreated(ctx, &e)

	case "follow.deleted":
		var e events.FollowDeleted
		if err := json.Unmarshal(value, &e); err != nil {
			p.log.Error("follow.deleted: unmarshal failed", zap.Error(err))
			return errMalformed
		}
		return p.handleFollowDeleted(ctx, &e)

	// BOARDS
	case "board.created":
		var e events.BoardCreated
		if err := json.Unmarshal(value, &e); err != nil {
			p.log.Error("board.created: unmarshal failed", zap.Error(err))
			return errMalformed
		}
		return p.handleBoardCreated(ctx, &e)

	case "board.updated":
		var e events.BoardUpdated
		if err := json.Unmarshal(value, &e); err != nil {
			p.log.Error("board.updated: unmarshal failed", zap.Error(err))
			return errMalformed
		}
		return p.handleBoardUpdated(ctx, &e)

	case "board.pins.added":
		var e events.BoardPinsAdded
		if err := json.Unmarshal(value, &e); err != nil {
			p.log.Error("board.pins.added: unmarshal failed", zap.Error(err))
			return errMalformed
		}
		return p.handleBoardPinsAdded(ctx, &e)

	case "board.pins.deleted":
		var e events.BoardPinsDeleted
		if err := json.Unmarshal(value, &e); err != nil {
			p.log.Error("board.pins.deleted: unmarshal failed", zap.Error(err))
			return errMalformed
		}
		return p.handleBoardPinsDeleted(ctx, &e)

	case "board.commented":
		var e events.BoardCommented
		if err := json.Unmarshal(value, &e); err != nil {
			p.log.Error("board.commented: unmarshal failed", zap.Error(err))
			return errMalformed
		}
		return p.handleBoardCommented(ctx, &e)

	case "board.comment.deleted":
		var e events.BoardCommentDeleted
		if err := json.Unmarshal(value, &e); err != nil {
			p.log.Error("board.comment.deleted: unmarshal failed", zap.Error(err))
			return errMalformed
		}
		return p.handleBoardCommentDeleted(ctx, &e)

	case "board.reaction.added":
		var e events.BoardReactionAdded
		if err := json.Unmarshal(value, &e); err != nil {
			p.log.Error("board.reaction.added: unmarshal failed", zap.Error(err))
			return errMalformed
		}
		return p.handleBoardReactionAdded(ctx, &e)

	case "board.reaction.deleted":
		var e events.BoardReactionDeleted
		if err := json.Unmarshal(value, &e); err != nil {
			p.log.Error("board.reaction.deleted: unmarshal failed", zap.Error(err))
			return errMalformed
		}
		return p.handleBoardReactionDeleted(ctx, &e)

	case "board.bookmark.added":
		var e events.BoardBookmarkAdded
		if err := json.Unmarshal(value, &e); err != nil {
			p.log.Error("board.bookmark.added: unmarshal failed", zap.Error(err))
			return errMalformed
		}
		return p.handleBoardBookmarkAdded(ctx, &e)

	case "board.bookmark.deleted":
		var e events.BoardBookmarkDeleted
		if err := json.Unmarshal(value, &e); err != nil {
			p.log.Error("board.bookmark.deleted: unmarshal failed", zap.Error(err))
			return errMalformed
		}
		return p.handleBoardBookmarkDeleted(ctx, &e)

	case "board.members.added":
		var e events.BoardGroupMembersAdded
		if err := json.Unmarshal(value, &e); err != nil {
			p.log.Error("board.members.added: unmarshal failed", zap.Error(err))
			return errMalformed
		}
		return p.handleBoardMembersAdded(ctx, &e)

	case "board.members.deleted":
		var e events.BoardGroupMembersDeleted
		if err := json.Unmarshal(value, &e); err != nil {
			p.log.Error("board.members.deleted: unmarshal failed", zap.Error(err))
			return errMalformed
		}
		return p.handleBoardMembersDeleted(ctx, &e)

	case "board.deleted":
		var e events.BoardDeleted
		if err := json.Unmarshal(value, &e); err != nil {
			p.log.Error("board.deleted: unmarshal failed", zap.Error(err))
			return errMalformed
		}
		return p.handleBoardDeleted(ctx, &e)

	// PINS
	case "pin.created":
		var e events.PinCreated
		if err := json.Unmarshal(value, &e); err != nil {
			p.log.Error("pin.created: unmarshal failed", zap.Error(err))
			return errMalformed
		}
		return p.handlePinCreated(ctx, &e)

	case "pin.updated":
		var e events.PinUpdated
		if err := json.Unmarshal(value, &e); err != nil {
			p.log.Error("pin.updated: unmarshal failed", zap.Error(err))
			return errMalformed
		}
		return p.handlePinUpdated(ctx, &e)

	case "pin.deleted":
		var e events.PinDeleted
		if err := json.Unmarshal(value, &e); err != nil {
			p.log.Error("pin.deleted: unmarshal failed", zap.Error(err))
			return errMalformed
		}
		return p.handlePinDeleted(ctx, &e)

	case "pin.commented":
		var e events.PinCommented
		if err := json.Unmarshal(value, &e); err != nil {
			p.log.Error("pin.commented: unmarshal failed", zap.Error(err))
			return errMalformed
		}
		return p.handlePinCommented(ctx, &e)

	case "pin.comment.deleted":
		var e events.PinCommentDeleted
		if err := json.Unmarshal(value, &e); err != nil {
			p.log.Error("pin.comment.deleted: unmarshal failed", zap.Error(err))
			return errMalformed
		}
		return p.handlePinCommentDeleted(ctx, &e)

	case "pin.reaction.added":
		var e events.PinReactionAdded
		if err := json.Unmarshal(value, &e); err != nil {
			p.log.Error("pin.reaction.added: unmarshal failed", zap.Error(err))
			return errMalformed
		}
		return p.handlePinReactionAdded(ctx, &e)

	case "pin.reaction.deleted":
		var e events.PinReactionDeleted
		if err := json.Unmarshal(value, &e); err != nil {
			p.log.Error("pin.reaction.deleted: unmarshal failed", zap.Error(err))
			return errMalformed
		}
		return p.handlePinReactionDeleted(ctx, &e)

	case "pin.bookmark.added":
		var e events.PinBookmarkAdded
		if err := json.Unmarshal(value, &e); err != nil {
			p.log.Error("pin.bookmark.added: unmarshal failed", zap.Error(err))
			return errMalformed
		}
		return p.handlePinBookmarkAdded(ctx, &e)

	case "pin.bookmark.deleted":
		var e events.PinBookmarkDeleted
		if err := json.Unmarshal(value, &e); err != nil {
			p.log.Error("pin.bookmark.deleted: unmarshal failed", zap.Error(err))
			return errMalformed
		}
		return p.handlePinBookmarkDeleted(ctx, &e)

	default:
		p.log.Warn("unknown topic", zap.String("topic", topic))
		return errors.New("unknown topic")
	}
}
