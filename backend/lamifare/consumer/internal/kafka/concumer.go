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

func NewConsumer(log *zap.Logger) *Consumer {
	return &Consumer{
		reader: kafka.NewReader(kafka.ReaderConfig{
			Brokers:  config.CFG.KafkaBrokers,
			Topic:    config.CFG.KafkaTopic,
			GroupID:  config.CFG.KafkaGroup,
			MinBytes: 10e3,
			MaxBytes: 10e6,
		}),
		log: log,
	}
}

func (c *Consumer) FetchMessage(ctx context.Context) (kafka.Message, error) {
	return c.reader.FetchMessage(ctx)
}

func (c *Consumer) CommitMessage(ctx context.Context, m kafka.Message) error {
	return c.reader.CommitMessages(ctx, m)
}

func (c *Consumer) Close() error {
	return c.reader.Close()
}
