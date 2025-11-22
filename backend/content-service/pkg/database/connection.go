package database

import (
	"content-service/pkg/config"
	"fmt"
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Connect() {
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s sslmode=disable",
		config.CFG.DBHost, config.CFG.DBUser, config.CFG.DBPassword, config.CFG.DBName)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("database connection error: ", err)
	}

	DB = db
	fmt.Println("successfully connected to database")
}
