package main

import (
	"log"
	"net"

	"geo-service/internal/handler"
	"geo-service/internal/repository"
	"geo-service/internal/service"
	"geo-service/pkg/geopb"

	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"
)

func main() {
	log.Println("Initializing dependencies...")

	cacheType := "memory" // TODO: Redis Cache
	cache, err := repository.NewCache(cacheType, "")
	if err != nil {
		log.Fatalf("Failed to create cache %s: %v", cacheType, err)
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
		log.Fatalf("Failed to listen on port %s: %v", port, err)
	}

	log.Printf("Geo service started successfully on port %s", port)
	log.Printf("gRPC server is running and ready to accept requests")

	if err := grpcServer.Serve(lis); err != nil {
		log.Fatalf("Failed to serve gRPC server: %v", err)
	}
}
