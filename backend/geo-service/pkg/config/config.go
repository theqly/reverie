package config

import (
	"errors"
	"os"
)

type Config struct {
	ServerAddress string
}

var CFG *Config

func LoadConfig() error {
	port := os.Getenv("PORT")

	if port == "" {
		return errors.New("environment variables not set")
	}

	CFG = &Config{
		ServerAddress: ":" + port,
	}

	return nil
}
