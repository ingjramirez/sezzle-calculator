package handler

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/jaime-ramirez/sezzle-calculator/backend/internal/history"
	"github.com/jaime-ramirez/sezzle-calculator/backend/internal/model"
)

func TestEvaluateHandler(t *testing.T) {
	tests := []struct {
		name       string
		method     string
		body       string
		wantStatus int
		wantResult *float64
		wantExpr   string
		wantError  string
	}{
		{
			name:       "successful expression",
			method:     http.MethodPost,
			body:       `{"expression":"(2 + 3) * 4"}`,
			wantStatus: http.StatusOK,
			wantResult: floatPtr(20),
			wantExpr:   "(2 + 3) * 4",
		},
		{
			name:       "successful with parentheses",
			method:     http.MethodPost,
			body:       `{"expression":"2 * (3 + 4)"}`,
			wantStatus: http.StatusOK,
			wantResult: floatPtr(14),
			wantExpr:   "2 * (3 + 4)",
		},
		{
			name:       "empty expression",
			method:     http.MethodPost,
			body:       `{"expression":""}`,
			wantStatus: http.StatusBadRequest,
			wantError:  "expression is required",
		},
		{
			name:       "whitespace-only expression",
			method:     http.MethodPost,
			body:       `{"expression":"   "}`,
			wantStatus: http.StatusBadRequest,
			wantError:  "expression is required",
		},
		{
			name:       "invalid expression mismatched parens",
			method:     http.MethodPost,
			body:       `{"expression":"(2 + 3"}`,
			wantStatus: http.StatusBadRequest,
			wantError:  "mismatched parentheses",
		},
		{
			name:       "division by zero",
			method:     http.MethodPost,
			body:       `{"expression":"1 / 0"}`,
			wantStatus: http.StatusBadRequest,
			wantError:  "division by zero",
		},
		{
			name:       "invalid JSON",
			method:     http.MethodPost,
			body:       `{invalid}`,
			wantStatus: http.StatusBadRequest,
			wantError:  "invalid JSON",
		},
		{
			name:       "wrong HTTP method GET",
			method:     http.MethodGet,
			body:       ``,
			wantStatus: http.StatusMethodNotAllowed,
			wantError:  "method not allowed",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			store := history.NewStore(50)
			handler := NewEvaluateHandler(store)

			req := httptest.NewRequest(tt.method, "/api/evaluate", bytes.NewBufferString(tt.body))
			req.Header.Set("Content-Type", "application/json")
			rr := httptest.NewRecorder()

			handler.ServeHTTP(rr, req)

			if rr.Code != tt.wantStatus {
				t.Errorf("status = %d, want %d", rr.Code, tt.wantStatus)
			}

			if tt.wantResult != nil {
				var resp model.EvaluateResponse
				if err := json.NewDecoder(rr.Body).Decode(&resp); err != nil {
					t.Fatalf("failed to decode response: %v", err)
				}
				if resp.Result != *tt.wantResult {
					t.Errorf("result = %f, want %f", resp.Result, *tt.wantResult)
				}
				if resp.Expression != tt.wantExpr {
					t.Errorf("expression = %q, want %q", resp.Expression, tt.wantExpr)
				}
			}

			if tt.wantError != "" {
				var resp model.ErrorResponse
				if err := json.NewDecoder(rr.Body).Decode(&resp); err != nil {
					t.Fatalf("failed to decode error response: %v", err)
				}
				if !contains(resp.Error, tt.wantError) {
					t.Errorf("error = %q, want it to contain %q", resp.Error, tt.wantError)
				}
			}
		})
	}
}

func TestEvaluateHandler_SavesHistory(t *testing.T) {
	store := history.NewStore(50)
	handler := NewEvaluateHandler(store)

	req := httptest.NewRequest(http.MethodPost, "/api/evaluate",
		bytes.NewBufferString(`{"expression":"(2 + 3) * 4"}`))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", rr.Code, http.StatusOK)
	}

	entries := store.List()
	if len(entries) != 1 {
		t.Fatalf("history len = %d, want 1", len(entries))
	}

	if entries[0].Operation != "expression" {
		t.Errorf("Operation = %q, want %q", entries[0].Operation, "expression")
	}
	if entries[0].Expression != "(2 + 3) * 4" {
		t.Errorf("Expression = %q, want %q", entries[0].Expression, "(2 + 3) * 4")
	}
	if entries[0].Result != 20 {
		t.Errorf("Result = %f, want 20", entries[0].Result)
	}
}

func TestEvaluateHandler_ErrorNotSaved(t *testing.T) {
	store := history.NewStore(50)
	handler := NewEvaluateHandler(store)

	req := httptest.NewRequest(http.MethodPost, "/api/evaluate",
		bytes.NewBufferString(`{"expression":"1 / 0"}`))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	entries := store.List()
	if len(entries) != 0 {
		t.Errorf("history len = %d, want 0 (errors should not be saved)", len(entries))
	}
}
