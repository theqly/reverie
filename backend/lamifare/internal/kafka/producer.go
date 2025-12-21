// internal/kafka/producer.go
package kafka

import (
	"context"
	"encoding/json"
	"time"

	"github.com/segmentio/kafka-go"
	"github.com/theqly/reverie/backend/lamifare/internal/config"
	"go.uber.org/zap"
)

type Producer struct {
	dlqTopic string
	writer   *kafka.Writer
	log      *zap.Logger
}

func NewProducer(logger *zap.Logger) *Producer {
	w := kafka.NewWriter(kafka.WriterConfig{
		Brokers:      config.CFG.KafkaBrokers,
		Balancer:     &kafka.Hash{},
		Async:        false,
		RequiredAcks: 1,
	})
	return &Producer{writer: w, log: logger, dlqTopic: "events.dlq"}
}

func (p *Producer) PublishDLQ(ctx context.Context, topic string, key, value []byte, err string) error {
	body := map[string]interface{}{
		"topic":       topic,
		"key":         string(key),
		"value":       json.RawMessage(value),
		"error":       err,
		"occurred_at": time.Now().UTC().Format(time.RFC3339),
	}

	b, _ := json.Marshal(body)

	msg := kafka.Message{
		Topic: p.dlqTopic,
		Key:   key,
		Value: b,
		Time:  time.Now(),
	}

	e := p.writer.WriteMessages(ctx, msg)
	if e != nil {
		p.log.Error("write message failed", zap.String("key", string(key)), zap.String("value", string(b)), zap.Error(e))
	} else {
		p.log.Info("written message", zap.String("key", string(key)), zap.String("value", string(b)))
	}

	return e
}

func (p *Producer) Close() error {
	p.log.Info("closing dlq producer")
	return p.writer.Close()
}
