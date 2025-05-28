package main

import (
	"context"
	"feed-service/graph/resolver"
	"feed-service/graph/generated"
	"feed-service/pkg/config"
	"feed-service/pkg/db"
	"feed-service/pkg/middleware"
	"github.com/99designs/gqlgen/graphql"
	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/gin-gonic/gin"
	"github.com/vektah/gqlparser/v2/gqlerror"
	"log"
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

	schema := generated.NewExecutableSchema(generated.Config{Resolvers: &resolver.Resolver{DB: db.DB}})

	srv := setupServer(schema)

	r := gin.Default()

	//r.Use(middleware.AuthMiddleware())
	r.Use(middleware.CorsMiddleware())

	r.POST("/query", gin.WrapH(srv))
	r.GET("/", gin.WrapH(playground.Handler("GraphQL", "/query")))

	err = r.Run(config.CFG.ServerAddress)
	if err != nil {
		log.Fatal("error running gin server: %w", err)
	}
}

func setupServer(schema graphql.ExecutableSchema) *handler.Server {
	srv := handler.New(schema)

	srv.AddTransport(transport.Options{})
	srv.AddTransport(transport.GET{})
	srv.AddTransport(transport.POST{})
	srv.AddTransport(transport.MultipartForm{})

	srv.SetErrorPresenter(func(ctx context.Context, err error) *gqlerror.Error {
		return graphql.DefaultErrorPresenter(ctx, err)
	})

	srv.Use(extension.Introspection{})

	return srv
}
