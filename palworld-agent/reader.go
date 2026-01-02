package main

import (
	"encoding/json"
	"io/ioutil"
	"log"
)

type Player struct {
	Name  string  `json:"name"`
	X     float64 `json:"x"`
	Y     float64 `json:"y"`
	Z     float64 `json:"z"`
}

type PlayersFile struct {
	Players []Player `json:"players"`
}

func ReadPlayers(path string) ([]Player, error) {
	data, err := ioutil.ReadFile(path)
	if err != nil {
		return nil, err
	}
	var pf PlayersFile
	if err := json.Unmarshal(data, &pf); err != nil {
		return nil, err
	}
	return pf.Players, nil
}
