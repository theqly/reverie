package main

import (
	"context"
	"log"
	"time"

	"github.com/99designs/gqlgen/graphql"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/vektah/gqlparser/v2/gqlerror"

	"content-service/graph/generated"
	"content-service/graph/resolver"
	"content-service/internal/mapper"
	"content-service/internal/repository"
	"content-service/pkg/config"
	"content-service/pkg/database"
	"content-service/pkg/middleware"

	kafka "github.com/theqly/reverie/backend/kafka-module"

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

func waitMigration(delay int) {
	for range delay {
		if database.DB.Migrator().HasTable("schema_migrations") {
			var count int64
			if err := database.DB.Table("schema_migrations").Where("dirty = ?", false).Count(&count).Error; err == nil && count > 0 {
				log.Print("migration completed")
				return
			}
		}
		time.Sleep(time.Second)
	}
	log.Fatal("migration timeout: migration not completed")
}

func main() {
	initLogger()

	if err := config.LoadConfig(); err != nil {
		log.Fatalf("config loading error: %v", err)
	}

	database.Connect()

	waitMigration(60)

	if err := mapper.LoadMappings(database.DB); err != nil {
		log.Fatalf("failed to load mappings from database: %v", err)
	}

	// kafkaPublisher := kafka.NewProducer([]string{"localhost:9092"}, nil)
	var kafkaPublisher *kafka.Producer
	kafkaPublisher = nil

	boardRepo := repository.NewBoardRepository(database.DB, kafkaPublisher)
	pinRepo := repository.NewPinRepository(database.DB, kafkaPublisher)
	reactionRepo := repository.NewReactionRepository(database.DB, kafkaPublisher)
	bookmarkRepo := repository.NewBookmarkRepository(database.DB, kafkaPublisher)

	resolver := &resolver.Resolver{
		BoardRepo:    boardRepo,
		PinRepo:      pinRepo,
		ReactionRepo: reactionRepo,
		BookmarkRepo: bookmarkRepo,
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
