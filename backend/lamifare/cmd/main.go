package main

import (
	"context"
	"time"

	"github.com/theqly/reverie/backend/lamifare/internal/config"
	"github.com/theqly/reverie/backend/lamifare/internal/kafka"
	"github.com/theqly/reverie/backend/lamifare/internal/log"
	"github.com/theqly/reverie/backend/lamifare/internal/metrics"
	"github.com/theqly/reverie/backend/lamifare/internal/opensearch"
	"github.com/theqly/reverie/backend/lamifare/internal/processor"
	"github.com/theqly/reverie/backend/lamifare/internal/server"

	"go.uber.org/zap"
)

var topics = []string{
	"user.created",
	"user.updated",
	"user.deleted",
	"follow.created",
	"follow.deleted",
	"board.created",
	"board.updated",
	"board.pins.added",
	"board.pins.deleted",
	"board.commented",
	"board.comment.deleted",
	"board.reaction.added",
	"board.reaction.deleted",
	"board.bookmark.added",
	"board.bookmark.deleted",
	"board.members.added",
	"board.members.deleted",
	"board.deleted",
	"pin.created",
	"pin.updated",
	"pin.deleted",
	"pin.commented",
	"pin.comment.deleted",
	"pin.reaction.added",
	"pin.reaction.deleted",
	"pin.bookmark.added",
	"pin.bookmark.deleted",
}

func main() {
	err := config.LoadConfig()
	if err != nil {
		panic(err)
	}

	logger, err := log.New()
	if err != nil {
		panic(err)
	}
	defer logger.Sync()

	metrics.Init()

	osClient, err := opensearch.New(logger)
	if err != nil {
		logger.Fatal("opensearch.New failed", zap.Error(err))
	}

	dlqProducer := kafka.NewProducer(logger)
	defer dlqProducer.Close()

	proc := processor.New(osClient, dlqProducer, logger)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	for _, t := range topics {
		topic := t
		go func(topic string) {
			logger.Info("starting reader", zap.String("topic", topic))
			consumer := kafka.NewConsumer(topic, config.CFG.KafkaGroup, logger)
			defer consumer.Close()

			for {
				msg, err := consumer.FetchMessage(ctx)

				if err != nil {
					if ctx.Err() != nil {
						logger.Info("stopping reader", zap.String("topic", topic), zap.Error(ctx.Err()))
						return
					}
					logger.Info("sleeping after err", zap.String("topic", topic), zap.Error(ctx.Err()))
					time.Sleep(200 * time.Millisecond)
					continue
				}

				if err := proc.Process(ctx, topic, msg.Key, msg.Value); err != nil {
					logger.Error("process failed", zap.Error(err), zap.String("topic", topic))
				}

				_ = consumer.CommitMessage(ctx, msg)
			}
		}(topic)
	}

	srv := server.New(config.CFG.ServerAddress, logger, cancel)

	srv.Run(ctx)

	// TODO graceful shutdown with endpoint(?)
}
