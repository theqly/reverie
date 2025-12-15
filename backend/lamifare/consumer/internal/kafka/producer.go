// internal/kafka/producer.go
package kafka

import (
	"context"
	"time"

	"github.com/segmentio/kafka-go"
	"github.com/theqly/reverie/backend/lamifare/internal/config"
	"go.uber.org/zap"
)

type Producer struct {
	writer *kafka.Writer
	log    *zap.Logger
}

func NewProducer(logger *zap.Logger) *Producer {
	w := kafka.NewWriter(kafka.WriterConfig{
		Brokers:      config.CFG.KafkaBrokers,
		Balancer:     &kafka.Hash{},
		Async:        false,
		RequiredAcks: 1,
	})
	return &Producer{writer: w, log: logger}
}

func (p *Producer) PublishDLQ(ctx context.Context, topic string, key, value []byte) error {
	msg := kafka.Message{
		Topic: topic,
		Key:   key,
		Value: value,
		Time:  time.Now(),
	}
	return p.writer.WriteMessages(ctx, msg)
}

func (p *Producer) Close() error {
	return p.writer.Close()
}
