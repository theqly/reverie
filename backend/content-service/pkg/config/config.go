package config

import (
	"log"
	"os"
)

type Config struct {
	ServerAddress string
	DBUser        string
	DBPassword    string
	DBName        string
	DBHost        string
	DBPort        string
}

var CFG *Config

func LoadConfig() error {
	dbuser := os.Getenv("POSTGRES_USER")
	dbpassword := os.Getenv("POSTGRES_PASSWORD")
	dbname := os.Getenv("POSTGRES_DB")
	dbhost := os.Getenv("POSTGRES_HOST")
	dbport := os.Getenv("DB_PORT")

	port := os.Getenv("PORT")

	if dbport == "" || port == "" || dbuser == "" || dbpassword == "" || dbname == "" || dbhost == "" {
		log.Fatal("environment variables not set")
	}

	CFG = &Config{
		ServerAddress: ":" + port,
		DBUser:        dbuser,
		DBPassword:    dbpassword,
		DBName:        dbname,
		DBHost:        dbhost,
		DBPort:        dbport,
	}

	return nil
}
