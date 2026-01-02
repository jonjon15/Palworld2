package main

import (
	"encoding/json"
	"io/ioutil"
	"net/http"
	"strings"
)

type IngestRequest struct {
	ServerID   string   `json:"server_id"`
	ServerName string   `json:"server_name"`
	Players    []Player `json:"players"`
}

func IngestHandler(w http.ResponseWriter, r *http.Request) {
	var req IngestRequest
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Bad Request", http.StatusBadRequest)
		return
	}
	if err := json.Unmarshal(body, &req); err != nil {
		http.Error(w, "Bad Request", http.StatusBadRequest)
		return
	}
	if req.ServerID == "" {
		http.Error(w, "Missing server_id", http.StatusBadRequest)
		return
	}
	UpdateServerState(req.ServerID, req.ServerName, req.Players)
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("OK"))
}

func ServersHandler(w http.ResponseWriter, r *http.Request) {
	servers := GetServers()
	resp := make([]map[string]interface{}, 0)
	for id, state := range servers {
		resp = append(resp, map[string]interface{}{
			"server_id":   id,
			"server_name": state.ServerName,
			"last_update": state.LastUpdate,
			"player_count": len(state.Players),
		})
	}
	json.NewEncoder(w).Encode(resp)
}

func ServerPlayersHandler(w http.ResponseWriter, r *http.Request) {
	// Espera /servers/{id}/players
	parts := strings.Split(r.URL.Path, "/")
	if len(parts) != 4 || parts[1] != "servers" || parts[3] != "players" {
		http.NotFound(w, r)
		return
	}
	serverID := parts[2]
	state, ok := GetServerPlayers(serverID)
	if !ok {
		http.Error(w, "Not Found", http.StatusNotFound)
		return
	}
	json.NewEncoder(w).Encode(state)
}
