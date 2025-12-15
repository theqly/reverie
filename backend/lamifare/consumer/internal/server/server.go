package server

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"go.uber.org/zap"
)

type Server struct {
	addr   string
	engine *gin.Engine
	log    *zap.Logger
}

func New(addr string, logger *zap.Logger) *Server {
	gin.SetMode(gin.ReleaseMode)

	r := gin.New()

	r.Use(gin.Recovery())
	r.Use(loggerHandler(logger))

	r.GET("/healthz", func(c *gin.Context) {
		c.String(http.StatusOK, "ok")
	})

	r.GET("/readyz", func(c *gin.Context) {
		c.String(http.StatusOK, "ok") // TODO
	})

	r.GET("/metrics", gin.WrapH(promhttp.Handler()))

	return &Server{
		addr:   addr,
		engine: r,
		log:    logger,
	}
}

func (s *Server) Run(ctx context.Context) {
	// later maybe more complex logic TODO
	s.engine.Run(s.addr)
}

func loggerHandler(logger *zap.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()

		path := c.FullPath()
		if path == "" {
			path = c.Request.URL.Path
		}

		c.Next()

		latency := time.Since(start)
		status := c.Writer.Status()

		logger.Info("http request",
			zap.String("method", c.Request.Method),
			zap.String("path", path),
			zap.Int("status", status),
			zap.Duration("latency", latency),
			zap.String("client_ip", c.ClientIP()),
			zap.String("user_agent", c.Request.UserAgent()),
		)
	}
}
