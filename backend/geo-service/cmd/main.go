package main

import (
	"log"
	"net"

	"geo-service/internal/handler"
	"geo-service/internal/logger"
	"geo-service/internal/repository"
	"geo-service/internal/service"
	"geo-service/pkg/geopb"

	"go.uber.org/zap"
	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"
)

func main() {
	if err := logger.Init("development"); err != nil {
		log.Fatalf("Failed to initialize logger: %v", err)
	}
	defer logger.Sync()

	logger.Log.Info("Starting geo service...")

	cacheType := "memory" // TODO: Redis Cache
	cache, err := repository.NewCache(cacheType, "")
	if err != nil {
		logger.Log.Fatal("Failed to create cache",
			zap.String("cacheType", cacheType),
			zap.Error(err),
		)
	}

	nominatimRepo := repository.NewNominatimRepo()
	geoService := service.NewGeoService(nominatimRepo, cache)
	geoHandler := handler.NewGeoHandler(geoService)

	grpcServer := grpc.NewServer(
	// Можно добавить интерцепторы для логирования, аутентификации и т.д.
	// grpc.UnaryInterceptor(loggingInterceptor),
	)

	geopb.RegisterGeoServiceServer(grpcServer, geoHandler)

	reflection.Register(grpcServer)

	port := ":50051"
	lis, err := net.Listen("tcp", port)
	if err != nil {
		logger.Log.Fatal("Failed to listen",
			zap.String("port", port),
			zap.Error(err),
		)
	}

	logger.Log.Info("Geo service started successfully", zap.String("port", port))
	logger.Log.Info("gRPC server is running and ready to accept requests")

	if err := grpcServer.Serve(lis); err != nil {
		logger.Log.Fatal("Failed to serve gRPC server", zap.Error(err))
	}
}
