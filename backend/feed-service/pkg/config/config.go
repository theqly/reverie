package config

import (
	"errors"
	"os"
)

type Config struct {
	ServerAddress string
	DBUser        string
	DBPassword    string
	DBName        string
	DBHost        string
}

var CFG *Config

func LoadConfig() error {
	dbuser := os.Getenv("POSTGRES_USER")
	dbpassword := os.Getenv("POSTGRES_PASSWORD")
	dbname := os.Getenv("POSTGRES_DB")
	dbhost := os.Getenv("POSTGRES_HOST")

	port := os.Getenv("PORT")

	if port == "" || dbuser == "" || dbpassword == "" || dbname == "" || dbhost == "" {
		return errors.New("environment variables not set")
	}

	CFG = &Config{
		ServerAddress: ":" + port,
		DBUser:        dbuser,
		DBPassword:    dbpassword,
		DBName:        dbname,
		DBHost:        dbhost,
	}

	return nil
}
