package main

import (
	"log"

	"content-service/internal/handler"
	"content-service/internal/repository"
	routers "content-service/internal/router"
	"content-service/internal/service"
	"content-service/pkg/config"
	"content-service/pkg/database"

	"github.com/gin-gonic/gin"
)

func main() {
	if err := config.LoadConfig(); err != nil {
		log.Fatalf("config loading error: %v", err)
	}

	database.Connect()

	pinRepo := repository.NewPinRepository(database.DB)
	pinService := service.NewPinService(pinRepo)
	pinHandler := handler.NewPinHandler(pinService)

	router := gin.Default()

	router.Use(corsMiddleware())

	if err := router.Run(config.CFG.ServerAddress); err != nil {
		log.Fatalf("server start error: %v", err)
	}

	routers.NewPinRouter(router, pinHandler)
}

func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		// c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		// c.Writer.Header().Set("Access-Control-Allow-Headers", "Origin, Authorization, Content-Type")
		// c.Writer.Header().Set("Access-Control-Expose-Headers", "X-User-Role, X-User-ID")

		// if c.Request.Method == "OPTIONS" {
		// 	c.AbortWithStatus(204)
		// 	return
		// }

		c.Next()
	}
}
