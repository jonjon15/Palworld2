package main

import (
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

type wsClient struct {
	conn *websocket.Conn
}

var (
	wsClients   = make(map[*wsClient]bool)
	wsClientsMu sync.Mutex
)

func wsBroadcastUpdate() {
	wsClientsMu.Lock()
	defer wsClientsMu.Unlock()
	for c := range wsClients {
		c.conn.WriteMessage(websocket.TextMessage, []byte("update"))
	}
}

func wsHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("WebSocket upgrade error:", err)
		return
	}
	client := &wsClient{conn: conn}
	wsClientsMu.Lock()
	wsClients[client] = true
	wsClientsMu.Unlock()
	defer func() {
		wsClientsMu.Lock()
		delete(wsClients, client)
		wsClientsMu.Unlock()
		conn.Close()
	}()
	for {
		_, _, err := conn.ReadMessage()
		if err != nil {
			break
		}
	}
}
