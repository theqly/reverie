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

	r := gin.Default()

	srv := handler.New(
		generated.NewExecutableSchema(generated.Config{Resolvers: &graph.Resolver{DB: db.DB}}),
	)

	r.POST("/query", gin.WrapH(srv))
	r.GET("/", gin.WrapH(playground.Handler("GraphQL", "/query")))

	err = r.Run(":8080")
	if err != nil {
		log.Fatal("error running gin server: %w", err)
	}
}
