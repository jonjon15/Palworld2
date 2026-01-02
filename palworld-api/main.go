package main

import (
	"log"
	"net/http"
)

func main() {
	log.Println("Palworld API Central iniciada.")
	SetupRoutes()
	log.Fatal(http.ListenAndServe(":8080", nil))
}
