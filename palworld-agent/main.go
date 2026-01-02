package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"
)

func main() {
	log.Println("Palworld Agent iniciado.")
	go RunAgent()

	// Espera sinal para finalizar
	c := make(chan os.Signal, 1)
	signal.Notify(c, syscall.SIGINT, syscall.SIGTERM)
	<-c
	log.Println("Palworld Agent finalizado.")
}
