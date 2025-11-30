package producer

import (
	"context"
	"time"

	"github.com/segmentio/kafka-go"
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

func (p *Producer) Publish(ctx context.Context, topic string, key string, value []byte) error {
	return p.writer.WriteMessages(ctx, kafka.Message{
		Topic: topic,
		Key:   []byte(key),
		Value: value,
	})
}

func (p *Producer) Close() error {
	return p.writer.Close()
}
