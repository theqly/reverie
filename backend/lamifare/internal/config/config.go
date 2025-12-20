package config

import (
	"encoding/json"
	"fmt"
	"os"
	"strings"
)

type Config struct {
	ServerAddress string

	KafkaBrokers []string
	KafkaGroup   string

	OpenSearchURL string

	LogLevel string
}

var CFG *Config

func LoadConfig() error {
	brokers_env := os.Getenv("KAFKA_BROKERS")
	var arr []string
	if err := json.Unmarshal([]byte(brokers_env), &arr); err != nil {
		return err
	}
	brokers := make([]string, 0, len(arr))
	for _, p := range arr {
		p = strings.TrimSpace(p)
		if p == "" {
			continue
		}
		brokers = append(brokers, p)
	}

	if len(brokers) == 0 {
		return fmt.Errorf("env var KAFKA_BROKERS required")
	}

	port := os.Getenv("PORT")
	if port == "" {
		return fmt.Errorf("env var PORT required")
	}

	lvl := os.Getenv("LOG_LEVEL")
	if lvl == "" {
		lvl = "info"
	}

	CFG = &Config{
		ServerAddress: ":" + port,
		KafkaBrokers:  brokers,
		KafkaGroup:    os.Getenv("KAFKA_GROUP"),
		OpenSearchURL: os.Getenv("OPENSEARCH_URL"),
		LogLevel:      lvl,
	}

	if CFG.KafkaGroup == "" || CFG.OpenSearchURL == "" {
		return fmt.Errorf("env vars KAFKA_GROUP OPENSEARCH_URL required")
	}

	return nil
}
