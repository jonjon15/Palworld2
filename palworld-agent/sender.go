package main

import (
	"bytes"
	"encoding/json"
	"log"
	"net/http"
	"time"
)

type Config struct {
	ServerID   string `yaml:"server_id"`
	ServerName string `yaml:"server_name"`
	JsonPath   string `yaml:"json_path"`
	API        struct {
		Endpoint string `yaml:"endpoint"`
		Token    string `yaml:"token"`
	} `yaml:"api"`
	IntervalSeconds int `yaml:"interval_seconds"`
}

type IngestRequest struct {
	ServerID   string   `json:"server_id"`
	ServerName string   `json:"server_name"`
	Players    []Player `json:"players"`
}

func RunAgent() {
	cfg, err := LoadConfig("config.yaml")
	if err != nil {
		log.Fatalf("Erro ao carregar config: %v", err)
	}
	for {
		players, err := ReadPlayers(cfg.JsonPath)
		if err != nil {
			log.Printf("Erro lendo JSON: %v", err)
		} else {
			SendPlayers(cfg, players)
		}
		time.Sleep(time.Duration(cfg.IntervalSeconds) * time.Second)
	}
}

func SendPlayers(cfg *Config, players []Player) {
	body, err := json.Marshal(IngestRequest{
		ServerID:   cfg.ServerID,
		ServerName: cfg.ServerName,
		Players:    players,
	})
	if err != nil {
		log.Printf("Erro serializando players: %v", err)
		return
	}

	req, err := http.NewRequest("POST", cfg.API.Endpoint, bytes.NewBuffer(body))
	if err != nil {
		log.Printf("Erro criando request: %v", err)
		return
	}
	req.Header.Set("Authorization", "Bearer "+cfg.API.Token)
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Printf("Erro ao enviar dados: %v", err)
		return
	}
	defer resp.Body.Close()
	if resp.StatusCode != 200 {
		log.Printf("API retornou status %d", resp.StatusCode)
	} else {
		log.Printf("Dados enviados com sucesso para API.")
	}
}
