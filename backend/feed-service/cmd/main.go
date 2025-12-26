package main

import (
	"context"
	"feed-service/graph/generated"
	"feed-service/graph/resolver"
	"feed-service/internal/os_client"
	"feed-service/pkg/config"
	"feed-service/pkg/middleware"
	"log"

	"github.com/99designs/gqlgen/graphql"
	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/gin-gonic/gin"
	"github.com/vektah/gqlparser/v2/gqlerror"
	"go.uber.org/zap"
)

func initLogger() {
	logger, err := zap.NewDevelopment()
	if err != nil {
		panic(err)
	}
	zap.ReplaceGlobals(logger)
}

func main() {
	initLogger()
	osClient := os_client.NewClient()

	// if err := config.LoadConfig(); err != nil {
	// 	log.Fatalf("config loading error: %v", err)
	// }

	resolver := &resolver.Resolver{
		OSClient: osClient,
	}

	schema := generated.NewExecutableSchema(generated.Config{Resolvers: resolver})

	srv := setupServer(schema)

	router := gin.Default()

	router.Use(middleware.CorsMiddleware())

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
