package main

import (
	"io/ioutil"
	"gopkg.in/yaml.v2"
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

func LoadConfig(path string) (*Config, error) {
	data, err := ioutil.ReadFile(path)
	if err != nil {
		return nil, err
	}
	var cfg Config
	if err := yaml.Unmarshal(data, &cfg); err != nil {
		return nil, err
	}
	return &cfg, nil
}
