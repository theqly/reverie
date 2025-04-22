package main

import (
	"log"
	"net/http"

	"content-service/graph/generated"
	"content-service/graph/resolver"
	"content-service/internal/repository"
	"content-service/internal/service"
	"content-service/pkg/config"
	"content-service/pkg/database"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/gin-gonic/gin"
)

func main() {
	if err := config.LoadConfig(); err != nil {
		log.Fatalf("config loading error: %v", err)
	}

	database.Connect()

	boardRepo := repository.NewBoardRepository(database.DB)
	pinRepo := repository.NewPinRepository(database.DB)

	boardService := service.NewBoardService(boardRepo)
	pinService := service.NewPinService(pinRepo)

	resolver := &resolver.Resolver{
		BoardService: boardService,
		PinService:   pinService,
	}
	srv := handler.NewDefaultServer(generated.NewExecutableSchema(generated.Config{Resolvers: resolver}))

	router := gin.Default()
	router.Use(corsMiddleware())

	// GraphQL endpoint
	router.POST("/query", func(c *gin.Context) {
		srv.ServeHTTP(c.Writer, c.Request)
	})

	router.GET("/", func(c *gin.Context) {
		playground.Handler("GraphQL playground", "/query").ServeHTTP(c.Writer, c.Request)
	})

	if err := router.Run(config.CFG.ServerAddress); err != nil {
		log.Fatalf("server start error: %v", err)
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
