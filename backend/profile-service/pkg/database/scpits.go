package database

import (
	"fmt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"log"
	"profile-service/pkg/config"
)

var DB *gorm.DB

func Connect() {

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s sslmode=disable",
		config.CFG.DBHost, config.CFG.DBUser, config.CFG.DBPassword, config.CFG.DBName)

	if dsn == "" {
		log.Fatal("Failed to build dsn from environment variables")
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("database connection error: ", err)
	}

	DB = db
	fmt.Println("successfully connected to database")
}
