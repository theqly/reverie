package producer

import (
	"context"
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"github.com/segmentio/kafka-go"
	"github.com/theqly/reverie/backend/kafka-module/events/v1"
	"go.uber.org/zap"
)

type Producer struct {
	writer *kafka.Writer
	// logger *zap.Logger
}

func NewProducer(brokers []string, logger *zap.Logger) *Producer {
	return &Producer{
		writer: kafka.NewWriter(kafka.WriterConfig{
			Brokers:       brokers,
			Async:         true,
			RequiredAcks:  1,
			BatchSize:     200,
			BatchTimeout:  5 * time.Millisecond,
			MaxAttempts:   5,
			QueueCapacity: 50000, // буфер на 50к сообщений
			// ErrorLogger:   kafka.LoggerFunc(logger.Error),
		}),
	}
}

func (p *Producer) Close() error {
	return p.writer.Close()
}

func NewBaseEvent() events.BaseEvent {
	return events.BaseEvent{
		EventID:    uuid.New().String(),
		OccurredAt: time.Now().UTC(),
	}
}

func (p *Producer) PublishUserCreated(ctx context.Context, event events.UserCreated) error {
	data, err := json.Marshal(event)
	if err != nil {
		return err
	}
	return p.writer.WriteMessages(ctx, kafka.Message{
		Topic: "user.created",
		Key:   []byte(event.UserID),
		Value: data,
	})
}

func (p *Producer) PublishUserUpdated(ctx context.Context, event events.UserUpdated) error {
	data, err := json.Marshal(event)
	if err != nil {
		return err
	}
	return p.writer.WriteMessages(ctx, kafka.Message{
		Topic: "user.updated",
		Key:   []byte(event.UserID),
		Value: data,
	})
}

func (p *Producer) PublishFollowCreated(ctx context.Context, event events.FollowCreated) error {
	data, err := json.Marshal(event)
	if err != nil {
		return err
	}
	key := event.UserID + "|" + event.FollowerID
	return p.writer.WriteMessages(ctx, kafka.Message{
		Topic: "follow.created",
		Key:   []byte(key),
		Value: data,
	})
}

func (p *Producer) PublishFollowDeleted(ctx context.Context, event events.FollowDeleted) error {
	data, err := json.Marshal(event)
	if err != nil {
		return err
	}
	key := event.UserID + "|" + event.FollowerID
	return p.writer.WriteMessages(ctx, kafka.Message{
		Topic: "follow.deleted",
		Key:   []byte(key),
		Value: data,
	})
}

func (p *Producer) PublishBoardCreated(ctx context.Context, event events.BoardCreated) error {
	data, err := json.Marshal(event)
	if err != nil {
		return err
	}
	return p.writer.WriteMessages(ctx, kafka.Message{
		Topic: "board.created",
		Key:   []byte(event.BoardID),
		Value: data,
	})
}

func (p *Producer) PublishBoardUpdated(ctx context.Context, event events.BoardUpdated) error {
	data, err := json.Marshal(event)
	if err != nil {
		return err
	}
	return p.writer.WriteMessages(ctx, kafka.Message{
		Topic: "board.updated",
		Key:   []byte(event.BoardID),
		Value: data,
	})
}

func (p *Producer) PublishBoardPinsAdded(ctx context.Context, event events.BoardPinsAdded) error {
	data, err := json.Marshal(event)
	if err != nil {
		return err
	}
	return p.writer.WriteMessages(ctx, kafka.Message{
		Topic: "board.pins.added",
		Key:   []byte(event.BoardID),
		Value: data,
	})
}

func (p *Producer) PublishBoardPinsRemoved(ctx context.Context, event events.BoardPinsRemoved) error {
	data, err := json.Marshal(event)
	if err != nil {
		return err
	}
	return p.writer.WriteMessages(ctx, kafka.Message{
		Topic: "board.pins.removed",
		Key:   []byte(event.BoardID),
		Value: data,
	})
}

func (p *Producer) PublishBoardCommentCountChanged(ctx context.Context, event events.BoardCommentCountChanged) error {
	data, err := json.Marshal(event)
	if err != nil {
		return err
	}
	return p.writer.WriteMessages(ctx, kafka.Message{
		Topic: "board.comment_count.changed",
		Key:   []byte(event.BoardID),
		Value: data,
	})
}

func (p *Producer) PublishBoardReactionCountChanged(ctx context.Context, event events.BoardReactionCountChanged) error {
	data, err := json.Marshal(event)
	if err != nil {
		return err
	}
	return p.writer.WriteMessages(ctx, kafka.Message{
		Topic: "board.reaction_count.changed",
		Key:   []byte(event.BoardID),
		Value: data,
	})
}

func (p *Producer) PublishBoardBookmarkCountChanged(ctx context.Context, event events.BoardBookmarkCountChanged) error {
	data, err := json.Marshal(event)
	if err != nil {
		return err
	}
	return p.writer.WriteMessages(ctx, kafka.Message{
		Topic: "board.bookmark_count.changed",
		Key:   []byte(event.BoardID),
		Value: data,
	})
}

func (p *Producer) PublishPinCreated(ctx context.Context, event events.PinCreated) error {
	data, err := json.Marshal(event)
	if err != nil {
		return err
	}
	return p.writer.WriteMessages(ctx, kafka.Message{
		Topic: "pin.created",
		Key:   []byte(event.PinID),
		Value: data,
	})
}

func (p *Producer) PublishPinUpdated(ctx context.Context, event events.PinUpdated) error {
	data, err := json.Marshal(event)
	if err != nil {
		return err
	}
	return p.writer.WriteMessages(ctx, kafka.Message{
		Topic: "pin.updated",
		Key:   []byte(event.PinID),
		Value: data,
	})
}

func (p *Producer) PublishPinCommentCountChanged(ctx context.Context, event events.PinCommentCountChanged) error {
	data, err := json.Marshal(event)
	if err != nil {
		return err
	}
	return p.writer.WriteMessages(ctx, kafka.Message{
		Topic: "pin.comment_count.changed",
		Key:   []byte(event.PinID),
		Value: data,
	})
}

func (p *Producer) PublishPinReactionCountChanged(ctx context.Context, event events.PinReactionCountChanged) error {
	data, err := json.Marshal(event)
	if err != nil {
		return err
	}
	return p.writer.WriteMessages(ctx, kafka.Message{
		Topic: "pin.reaction_count.changed",
		Key:   []byte(event.PinID),
		Value: data,
	})
}

func (p *Producer) PublishPinBookmarkCountChanged(ctx context.Context, event events.PinBookmarkCountChanged) error {
	data, err := json.Marshal(event)
	if err != nil {
		return err
	}
	return p.writer.WriteMessages(ctx, kafka.Message{
		Topic: "pin.bookmark_count.changed",
		Key:   []byte(event.PinID),
		Value: data,
	})
}
