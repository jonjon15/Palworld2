package main

import (
	"sync"
	"time"
)

type Player struct {
	Name  string  `json:"name"`
	X     float64 `json:"x"`
	Y     float64 `json:"y"`
	Z     float64 `json:"z"`
}

type ServerState struct {
	ServerID   string    `json:"server_id"`
	ServerName string    `json:"server_name"`
	Players    []Player  `json:"players"`
	LastUpdate time.Time `json:"last_update"`
}

var (
	cache      = make(map[string]*ServerState)
	cacheMutex sync.RWMutex
)

func UpdateServerState(serverID, serverName string, players []Player) {
	cacheMutex.Lock()
	defer cacheMutex.Unlock()
	cache[serverID] = &ServerState{
		ServerID:   serverID,
		ServerName: serverName,
		Players:    players,
		LastUpdate: time.Now(),
	}
}

func GetServers() map[string]*ServerState {
	cacheMutex.RLock()
	defer cacheMutex.RUnlock()
	copy := make(map[string]*ServerState)
	for k, v := range cache {
		copy[k] = v
	}
	return copy
}

func GetServerPlayers(serverID string) (*ServerState, bool) {
	cacheMutex.RLock()
	defer cacheMutex.RUnlock()
	state, ok := cache[serverID]
	return state, ok
}
