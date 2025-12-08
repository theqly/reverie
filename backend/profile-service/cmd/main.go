package main

import (
	"context"
	"log"
	"time"

	"profile-service/graph/generated"
	"profile-service/graph/resolver"
	"profile-service/internal/repository"
	"profile-service/pkg/config"
	"profile-service/pkg/database"
	"profile-service/pkg/middleware"

	kafka "github.com/theqly/reverie/backend/kafka-module"

	"github.com/99designs/gqlgen/graphql"
	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/gin-gonic/gin"
	"github.com/vektah/gqlparser/v2/gqlerror"
)

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
	err := config.LoadConfig()
	if err != nil {
		log.Fatal("error loading config: %w", err)
	}

	// err = middleware.InitJWKS("https://www.googleapis.com/oauth2/v3/certs") // currently without config
	// if err != nil {
	// log.Fatal("error loading config: %w", err)
	// }

	err = database.Connect()
	if err != nil {
		log.Fatal("error loading config: %w", err)
	}

	waitMigration(60)

	kafkaPublisher := kafka.NewProducer([]string{"localhost:9092"}, nil)

	userRepo := repository.NewUserRepository(database.DB, kafkaPublisher)

	resolver := &resolver.Resolver{
		UserRepo: userRepo,
	}

	schema := generated.NewExecutableSchema(generated.Config{Resolvers: resolver})

	srv := setupServer(schema)

	r := gin.Default()

	// r.Use(middleware.AuthMiddleware())
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
