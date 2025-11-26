package database

import (
	"errors"
	"fmt"
	"profile-service/pkg/config"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Connect() error {

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s sslmode=disable",
		config.CFG.DBHost, config.CFG.DBUser, config.CFG.DBPassword, config.CFG.DBName)

	if dsn == "" {
		return errors.New("failed to build dsn from environment variables")
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		txt := fmt.Sprintf("database connection error: %s", err.Error())
		return errors.New(txt)
	}

	DB = db
	return nil
}
