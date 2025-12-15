package main

import (
	"context"
	"os"
	"os/signal"
	"syscall"
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

func main() {
	err := config.LoadConfig()
	if err != nil {
		panic(err)
	}

	logger, _ := log.New()
	defer logger.Sync()

	metrics.Init()

	opensearchClient, err := opensearch.NewClient(logger)
	if err != nil {
		logger.Fatal("es new", zap.Error(err))
	}

	consumer := kafka.NewConsumer(logger)
	defer consumer.Close()

	proc := processor.New(opensearchClient, dlq, logger)

	srv := server.New(cfg.HealthAddr, logger)
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// start health server
	go srv.Run(ctx)

	// workers
	for i := 0; i < cfg.Workers; i++ {
		go func(workerID int) {
			logger.Info("worker started", zap.Int("id", workerID))
			for {
				msg, err := consumer.FetchMessage(ctx)
				if err != nil {
					logger.Warn("fetch message error", zap.Error(err))
					time.Sleep(500 * time.Millisecond)
					continue
				}
				if err := proc.Process(ctx, msg.Key, msg.Value); err != nil {
					logger.Error("process failed", zap.Error(err))
					// optionally publish to DLQ or retry - processor handles DLQ for malformed
				} else {
					_ = consumer.CommitMessage(ctx, msg)
				}
			}
		}(i)
	}

	// graceful shutdown
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)
	<-stop
	logger.Info("shutting down")
	cancel()
	// allow some time
	time.Sleep(2 * time.Second)
}
