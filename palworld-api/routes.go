package main

import (
	"net/http"
)

func SetupRoutes() {
	http.HandleFunc("/ingest", AuthMiddleware(IngestHandler))
	http.HandleFunc("/servers", ServersHandler)
	http.HandleFunc("/servers/", ServerPlayersHandler)
	http.HandleFunc("/ws", wsHandler)
}
