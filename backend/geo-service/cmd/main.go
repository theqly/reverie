package main

import (
	"context"
	"geo-service/graph/generated"
	"geo-service/graph/resolver"
	"geo-service/internal/repository"
	"geo-service/pkg/config"
	"geo-service/pkg/database"
	"geo-service/pkg/middleware"
	"log"

	"github.com/99designs/gqlgen/graphql"
	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/gin-gonic/gin"
	"github.com/vektah/gqlparser/v2/gqlerror"
)

func main() {
	err := config.LoadConfig()
	if err != nil {
		log.Fatal("error loading config: %w", err)
	}

	err = database.Connect()
	if err != nil {
		log.Fatal("error loading config: %w", err)
	}

	geoRepo := repository.NewGeoRepository(database.DB)

	resolver := &resolver.Resolver{
		GeoRepo: geoRepo,
	}

	schema := generated.NewExecutableSchema(generated.Config{Resolvers: resolver})

	srv := setupServer(schema)

	r := gin.Default()

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
