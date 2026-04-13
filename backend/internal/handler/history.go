package handler

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/jaime-ramirez/sezzle-calculator/backend/internal/history"
)

// NewHistoryHandler returns a handler that serves GET and DELETE for history.
func NewHistoryHandler(store *history.Store) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			entries := store.List()
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			if err := json.NewEncoder(w).Encode(entries); err != nil {
				log.Printf("encode response: %v", err)
			}
		case http.MethodDelete:
			store.Clear()
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			if err := json.NewEncoder(w).Encode(map[string]string{"status": "cleared"}); err != nil {
				log.Printf("encode response: %v", err)
			}
		default:
			writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		}
	}
}
