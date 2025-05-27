package main

import (
	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/gin-gonic/gin"
	"log"
	"profile-service/internal/graph"
	"profile-service/internal/graph/generated"
	"profile-service/pkg/config"
	"profile-service/pkg/db"
	"profile-service/pkg/middleware"
)

func main() {
	err := config.LoadConfig()
	if err != nil {
		log.Fatal("error loading config: %w", err)
	}

	err = db.Connect()
	if err != nil {
		log.Fatal("error loading config: %w", err)
	}

	srv := handler.New(
		generated.NewExecutableSchema(generated.Config{Resolvers: &graph.Resolver{DB: db.DB}}),
	)

	r := gin.Default()

	r.Use(middleware.AuthMiddleware())
	r.Use(middleware.CorsMiddleware())

	r.POST("/query", gin.WrapH(srv))
	r.GET("/", gin.WrapH(playground.Handler("GraphQL", "/query")))

	err = r.Run(config.CFG.ServerAddress)
	if err != nil {
		log.Fatal("error running gin server: %w", err)
	}
}
