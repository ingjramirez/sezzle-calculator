package handler

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/jaime-ramirez/sezzle-calculator/backend/internal/history"
	"github.com/jaime-ramirez/sezzle-calculator/backend/internal/model"
)

func TestHistoryHandler_GetEmpty(t *testing.T) {
	store := history.NewStore(50)
	handler := NewHistoryHandler(store)

	req := httptest.NewRequest(http.MethodGet, "/api/history", nil)
	rr := httptest.NewRecorder()

	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", rr.Code, http.StatusOK)
	}

	var entries []model.HistoryEntry
	if err := json.NewDecoder(rr.Body).Decode(&entries); err != nil {
		t.Fatalf("decode error: %v", err)
	}
	if len(entries) != 0 {
		t.Errorf("len = %d, want 0", len(entries))
	}
}

func TestHistoryHandler_GetWithEntries(t *testing.T) {
	store := history.NewStore(50)
	b := 3.0
	store.Add("add", 2, &b, 5)
	store.Add("subtract", 10, &b, 7)

	handler := NewHistoryHandler(store)

	req := httptest.NewRequest(http.MethodGet, "/api/history", nil)
	rr := httptest.NewRecorder()

	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", rr.Code, http.StatusOK)
	}

	var entries []model.HistoryEntry
	if err := json.NewDecoder(rr.Body).Decode(&entries); err != nil {
		t.Fatalf("decode error: %v", err)
	}
	if len(entries) != 2 {
		t.Fatalf("len = %d, want 2", len(entries))
	}

	// Newest first
	if entries[0].Operation != "subtract" {
		t.Errorf("entries[0].Operation = %q, want %q", entries[0].Operation, "subtract")
	}
	if entries[1].Operation != "add" {
		t.Errorf("entries[1].Operation = %q, want %q", entries[1].Operation, "add")
	}
}

func TestHistoryHandler_Delete(t *testing.T) {
	store := history.NewStore(50)
	b := 3.0
	store.Add("add", 2, &b, 5)

	handler := NewHistoryHandler(store)

	req := httptest.NewRequest(http.MethodDelete, "/api/history", nil)
	rr := httptest.NewRecorder()

	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", rr.Code, http.StatusOK)
	}

	var resp map[string]string
	if err := json.NewDecoder(rr.Body).Decode(&resp); err != nil {
		t.Fatalf("decode error: %v", err)
	}
	if resp["status"] != "cleared" {
		t.Errorf("status = %q, want %q", resp["status"], "cleared")
	}

	// Verify history is empty
	entries := store.List()
	if len(entries) != 0 {
		t.Errorf("history should be empty after DELETE, got %d entries", len(entries))
	}
}

func TestHistoryHandler_MethodNotAllowed(t *testing.T) {
	store := history.NewStore(50)
	handler := NewHistoryHandler(store)

	methods := []string{http.MethodPost, http.MethodPut, http.MethodPatch}
	for _, method := range methods {
		t.Run(method, func(t *testing.T) {
			req := httptest.NewRequest(method, "/api/history", nil)
			rr := httptest.NewRecorder()

			handler.ServeHTTP(rr, req)

			if rr.Code != http.StatusMethodNotAllowed {
				t.Errorf("status = %d, want %d", rr.Code, http.StatusMethodNotAllowed)
			}

			var resp model.ErrorResponse
			if err := json.NewDecoder(rr.Body).Decode(&resp); err != nil {
				t.Fatalf("decode error: %v", err)
			}
			if resp.Error != "method not allowed" {
				t.Errorf("error = %q, want %q", resp.Error, "method not allowed")
			}
		})
	}
}
