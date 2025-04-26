package main

import (
	"log"

	"content-service/graph/generated"
	"content-service/graph/resolver"
	"content-service/internal/repository"
	"content-service/pkg/config"
	"content-service/pkg/database"
	"content-service/pkg/middleware"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
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

	resolver := &resolver.Resolver{
		BoardRepo: boardRepo,
		PinRepo:   pinRepo,
	}
	// srv := handler.NewDefaultServer(generated.NewExecutableSchema(generated.Config{Resolvers: resolver}))

	srv := handler.New(generated.NewExecutableSchema(generated.Config{Resolvers: resolver}))

	srv.Use(extension.Introspection{})

	router := gin.Default()

	router.Use(middleware.CorsMiddleware())

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
