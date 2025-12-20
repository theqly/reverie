package kafka

import (
	"context"

	"github.com/theqly/reverie/backend/lamifare/internal/config"

	"github.com/segmentio/kafka-go"
	"go.uber.org/zap"
)

type Consumer struct {
	reader *kafka.Reader
	log    *zap.Logger
}

func NewConsumer(kafkaTopic string, kafkaGroup string, log *zap.Logger) *Consumer {
	return &Consumer{
		reader: kafka.NewReader(kafka.ReaderConfig{
			Brokers:  config.CFG.KafkaBrokers,
			Topic:    kafkaTopic,
			GroupID:  kafkaGroup,
			MinBytes: 10e3,
			MaxBytes: 10e6,
		}),
		log: log,
	}
}

func (c *Consumer) FetchMessage(ctx context.Context) (kafka.Message, error) {
	msg, err := c.reader.FetchMessage(ctx)
	if err != nil {
		c.log.Error("fetch message failed", zap.String("key", string(msg.Key)), zap.String("value", string(msg.Value)), zap.Error(err))
	} else {
		c.log.Info("fetched message", zap.String("key", string(msg.Key)), zap.String("value", string(msg.Value)))
	}
	return msg, err
}

func (c *Consumer) CommitMessage(ctx context.Context, msg kafka.Message) error {
	err := c.reader.CommitMessages(ctx, msg)
	if err != nil {
		c.log.Error("commit message failed", zap.String("key", string(msg.Key)), zap.String("value", string(msg.Value)), zap.Error(err))
	} else {
		c.log.Info("commited message", zap.String("key", string(msg.Key)), zap.String("value", string(msg.Value)))
	}
	return err
}

func (c *Consumer) Close() error {
	c.log.Info("closing consumer", zap.String("topic", c.reader.Config().Topic))
	return c.reader.Close()
}
