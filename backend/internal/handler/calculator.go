package handler

import (
	"encoding/json"
	"net/http"

	"github.com/jaime-ramirez/sezzle-calculator/backend/internal/engine"
	"github.com/jaime-ramirez/sezzle-calculator/backend/internal/history"
	"github.com/jaime-ramirez/sezzle-calculator/backend/internal/model"
)

// NewCalculateHandler returns an http.HandlerFunc that handles POST /api/calculate
// requests and saves successful calculations to the given history store.
func NewCalculateHandler(store *history.Store) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			writeError(w, http.StatusMethodNotAllowed, "method not allowed")
			return
		}

		var req model.CalculateRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			writeError(w, http.StatusBadRequest, "invalid JSON: "+err.Error())
			return
		}

		if req.Operation == "" {
			writeError(w, http.StatusBadRequest, "operation is required")
			return
		}

		if req.A == nil {
			writeError(w, http.StatusBadRequest, "field 'a' is required")
			return
		}

		var result float64
		var err error

		if req.B == nil {
			// Unary operation: only A is provided
			result, err = engine.CalculateUnary(req.Operation, *req.A)
		} else {
			// Binary operation: both A and B are provided
			result, err = engine.Calculate(req.Operation, *req.A, *req.B)
		}

		if err != nil {
			writeError(w, http.StatusBadRequest, err.Error())
			return
		}

		// Save to history
		var bPtr *float64
		if req.B != nil {
			bPtr = req.B
		}
		store.Add(req.Operation, *req.A, bPtr, result)

		resp := model.CalculateResponse{
			Result:    result,
			Operation: req.Operation,
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(resp)
	}
}

// writeError writes a JSON error response.
func writeError(w http.ResponseWriter, status int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(model.ErrorResponse{Error: message})
}
