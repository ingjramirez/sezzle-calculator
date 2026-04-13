package main

import (
	"log"
	"net/http"

	"github.com/jaime-ramirez/sezzle-calculator/backend/internal/handler"
)

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/api/calculate", handler.CalculateHandler)

	wrapped := handler.CORS(mux)

	addr := ":8080"
	log.Printf("Calculator API server starting on %s", addr)
	if err := http.ListenAndServe(addr, wrapped); err != nil {
		log.Fatalf("server failed: %v", err)
	}
}
