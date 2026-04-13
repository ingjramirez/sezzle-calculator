package handler

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/jaime-ramirez/sezzle-calculator/backend/internal/engine"
	"github.com/jaime-ramirez/sezzle-calculator/backend/internal/history"
	"github.com/jaime-ramirez/sezzle-calculator/backend/internal/model"
)

// NewEvaluateHandler returns an http.HandlerFunc that handles POST /api/evaluate
// requests, evaluates math expressions, and saves results to history.
func NewEvaluateHandler(store *history.Store) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			writeError(w, http.StatusMethodNotAllowed, "method not allowed")
			return
		}

		var req model.EvaluateRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			writeError(w, http.StatusBadRequest, "invalid JSON: "+err.Error())
			return
		}

		expression := strings.TrimSpace(req.Expression)
		if expression == "" {
			writeError(w, http.StatusBadRequest, "expression is required")
			return
		}

		result, err := engine.Evaluate(expression)
		if err != nil {
			writeError(w, http.StatusBadRequest, err.Error())
			return
		}

		// Save to history
		store.AddExpression(expression, result)

		resp := model.EvaluateResponse{
			Result:     result,
			Expression: expression,
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(resp)
	}
}
