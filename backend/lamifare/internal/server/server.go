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
	sdFn   context.CancelFunc
	done   chan struct{}
}

func New(addr string, logger *zap.Logger, sdFn context.CancelFunc) *Server {
	gin.SetMode(gin.ReleaseMode)

	r := gin.New()

	r.Use(gin.Recovery())
	r.Use(loggerMiddleware(logger))
	r.Use(corsMiddleware())

	r.GET("/healthz", func(c *gin.Context) {
		c.String(http.StatusOK, "ok")
	})

	r.GET("/readyz", func(c *gin.Context) {
		c.String(http.StatusOK, "ok") // TODO
	})

	r.GET("/metrics", gin.WrapH(promhttp.Handler()))

	r.POST("/shutdown", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "shutting_down"}) // fake lol
	})

	s := &Server{
		addr:   addr,
		engine: r,
		log:    logger,
		sdFn:   sdFn,
		done:   make(chan struct{}),
	}

	return s
}

func (s *Server) Run(ctx context.Context) {
	// later maybe more complex logic TODO
	s.engine.Run(s.addr)
}

func loggerMiddleware(logger *zap.Logger) gin.HandlerFunc {
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

func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Origin, Authorization, Content-Type")
		c.Writer.Header().Set("Access-Control-Expose-Headers", "X-User-Role, X-User-ID")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}
