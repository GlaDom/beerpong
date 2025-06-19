package main

import (
	"encoding/json"
	"os"

	"github.com/gladom/beerpong/pkg/requestvalidation"
)

type BeerpongConfig struct {
	Auth0Config    *requestvalidation.Auth0Config `json:"Auth0Config"`
	DatabaseConfig *DatabaseConfig                `json:"DatabaseConfig"`
}

type DatabaseConfig struct {
	Host     string `json:"Host"`
	Port     int    `json:"Port"`
	User     string `json:"User"`
	Password string `json:"Password"`
	Database string `json:"Database"`
}

func LoadConfig(path string) (*BeerpongConfig, error) {
	file, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	decoder := json.NewDecoder(file)
	config := &BeerpongConfig{}
	if err := decoder.Decode(config); err != nil {
		return nil, err
	}
	return config, nil
}
