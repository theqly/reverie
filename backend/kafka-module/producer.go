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

func (p *Producer) PublishUserDeleted(ctx context.Context, event events.UserDeleted) error {
	data, err := json.Marshal(event)
	if err != nil {
		return err
	}
	return p.writer.WriteMessages(ctx, kafka.Message{
		Topic: "user.deleted",
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

func (p *Producer) PublishBoardPinsDeleted(ctx context.Context, event events.BoardPinsDeleted) error {
	data, err := json.Marshal(event)
	if err != nil {
		return err
	}
	return p.writer.WriteMessages(ctx, kafka.Message{
		Topic: "board.pins.deleted",
		Key:   []byte(event.BoardID),
		Value: data,
	})
}

func (p *Producer) PublishBoardCommented(ctx context.Context, event events.BoardCommented) error {
	data, err := json.Marshal(event)
	if err != nil {
		return err
	}
	return p.writer.WriteMessages(ctx, kafka.Message{
		Topic: "board.commented",
		Key:   []byte(event.BoardID),
		Value: data,
	})
}

func (p *Producer) PublishBoardCommentUpdated(ctx context.Context, event events.BoardCommentUpdated) error {
	data, err := json.Marshal(event)
	if err != nil {
		return err
	}

	return p.writer.WriteMessages(ctx, kafka.Message{
		Topic: "board.comment.updated",
		Key:   []byte(event.CommentID),
		Value: data,
	})
}

func (p *Producer) PublishBoardCommentDeleted(ctx context.Context, event events.BoardCommentDeleted) error {
	data, err := json.Marshal(event)
	if err != nil {
		return err
	}
	return p.writer.WriteMessages(ctx, kafka.Message{
		Topic: "board.comment.deleted",
		Key:   []byte(event.CommentID),
		Value: data,
	})
}

func (p *Producer) PublishBoardReactionAdded(ctx context.Context, event events.BoardReactionAdded) error {
	data, err := json.Marshal(event)
	if err != nil {
		return err
	}
	return p.writer.WriteMessages(ctx, kafka.Message{
		Topic: "board.reaction.added",
		Key:   []byte(event.BoardID),
		Value: data,
	})
}

func (p *Producer) PublishBoardReactionDeleted(ctx context.Context, event events.BoardReactionDeleted) error {
	data, err := json.Marshal(event)
	if err != nil {
		return err
	}
	return p.writer.WriteMessages(ctx, kafka.Message{
		Topic: "board.reaction.deleted",
		Key:   []byte(event.BoardID),
		Value: data,
	})
}

func (p *Producer) PublishBoardBookmarkAdded(ctx context.Context, event events.BoardBookmarkAdded) error {
	data, err := json.Marshal(event)
	if err != nil {
		return err
	}
	return p.writer.WriteMessages(ctx, kafka.Message{
		Topic: "board.bookmark.added",
		Key:   []byte(event.BoardID),
		Value: data,
	})
}

func (p *Producer) PublishBoardBookmarkDeleted(ctx context.Context, event events.BoardBookmarkDeleted) error {
	data, err := json.Marshal(event)
	if err != nil {
		return err
	}
	return p.writer.WriteMessages(ctx, kafka.Message{
		Topic: "board.bookmark.deleted",
		Key:   []byte(event.BoardID),
		Value: data,
	})
}

func (p *Producer) PublishBoardGroupMembersAdded(ctx context.Context, event events.BoardGroupMembersAdded) error {
	data, err := json.Marshal(event)
	if err != nil {
		return err
	}
	return p.writer.WriteMessages(ctx, kafka.Message{
		Topic: "board.members.added",
		Key:   []byte(event.BoardID),
		Value: data,
	})
}

func (p *Producer) PublishBoardGroupMembersDeleted(ctx context.Context, event events.BoardGroupMembersDeleted) error {
	data, err := json.Marshal(event)
	if err != nil {
		return err
	}
	return p.writer.WriteMessages(ctx, kafka.Message{
		Topic: "board.members.deleted",
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

func (p *Producer) PublishPinDeleted(ctx context.Context, event events.PinDeleted) error {
	data, err := json.Marshal(event)
	if err != nil {
		return err
	}
	return p.writer.WriteMessages(ctx, kafka.Message{
		Topic: "pin.deleted",
		Key:   []byte(event.PinID),
		Value: data,
	})
}

func (p *Producer) PublishPinCommented(ctx context.Context, event events.PinCommented) error {
	data, err := json.Marshal(event)
	if err != nil {
		return err
	}
	return p.writer.WriteMessages(ctx, kafka.Message{
		Topic: "pin.commented",
		Key:   []byte(event.PinID),
		Value: data,
	})
}

func (p *Producer) PublishPinCommentUpdated(ctx context.Context, event events.PinCommentUpdated) error {
	data, err := json.Marshal(event)
	if err != nil {
		return err
	}
	return p.writer.WriteMessages(ctx, kafka.Message{
		Topic: "pin.comment.updated",
		Key:   []byte(event.CommentID),
		Value: data,
	})
}

func (p *Producer) PublishPinCommentDeleted(ctx context.Context, event events.PinCommentDeleted) error {
	data, err := json.Marshal(event)
	if err != nil {
		return err
	}
	return p.writer.WriteMessages(ctx, kafka.Message{
		Topic: "pin.comment.deleted",
		Key:   []byte(event.CommentID),
		Value: data,
	})
}

func (p *Producer) PublishPinReactionAdded(ctx context.Context, event events.PinReactionAdded) error {
	data, err := json.Marshal(event)
	if err != nil {
		return err
	}
	return p.writer.WriteMessages(ctx, kafka.Message{
		Topic: "pin.reaction.added",
		Key:   []byte(event.PinID),
		Value: data,
	})
}

func (p *Producer) PublishPinReactionDeleted(ctx context.Context, event events.PinReactionDeleted) error {
	data, err := json.Marshal(event)
	if err != nil {
		return err
	}
	return p.writer.WriteMessages(ctx, kafka.Message{
		Topic: "pin.reaction.deleted",
		Key:   []byte(event.PinID),
		Value: data,
	})
}

func (p *Producer) PublishPinBookmarkAdded(ctx context.Context, event events.PinBookmarkAdded) error {
	data, err := json.Marshal(event)
	if err != nil {
		return err
	}
	return p.writer.WriteMessages(ctx, kafka.Message{
		Topic: "pin.bookmark.added",
		Key:   []byte(event.PinID),
		Value: data,
	})
}

func (p *Producer) PublishPinBookmarkDeleted(ctx context.Context, event events.PinBookmarkDeleted) error {
	data, err := json.Marshal(event)
	if err != nil {
		return err
	}
	return p.writer.WriteMessages(ctx, kafka.Message{
		Topic: "pin.bookmark.deleted",
		Key:   []byte(event.PinID),
		Value: data,
	})
}
