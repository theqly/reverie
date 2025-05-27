package main

import (
	"context"
	"github.com/99designs/gqlgen/graphql"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/vektah/gqlparser/v2/gqlerror"
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

	schema := generated.NewExecutableSchema(generated.Config{Resolvers: resolver})

	srv := setupServer(schema)

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
