package main

import (
	"context"
	"encoding/json"
	"net"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/jaime-ramirez/sezzle-calculator/backend/internal/model"
)

func TestNewServer_Calculate(t *testing.T) {
	srv := newServer()

	req := httptest.NewRequest(http.MethodPost, "/api/calculate",
		strings.NewReader(`{"operation":"add","a":1,"b":2}`))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()

	srv.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", rr.Code, http.StatusOK)
	}

	var resp struct {
		Result    float64 `json:"result"`
		Operation string  `json:"operation"`
	}
	if err := json.NewDecoder(rr.Body).Decode(&resp); err != nil {
		t.Fatalf("decode error: %v", err)
	}
	if resp.Result != 3 {
		t.Errorf("result = %f, want 3", resp.Result)
	}
	if resp.Operation != "add" {
		t.Errorf("operation = %q, want %q", resp.Operation, "add")
	}
}

func TestNewServer_Evaluate(t *testing.T) {
	srv := newServer()

	req := httptest.NewRequest(http.MethodPost, "/api/evaluate",
		strings.NewReader(`{"expression":"(2+3)*4"}`))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()

	srv.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", rr.Code, http.StatusOK)
	}

	var resp struct {
		Result     float64 `json:"result"`
		Expression string  `json:"expression"`
	}
	if err := json.NewDecoder(rr.Body).Decode(&resp); err != nil {
		t.Fatalf("decode error: %v", err)
	}
	if resp.Result != 20 {
		t.Errorf("result = %f, want 20", resp.Result)
	}
	if resp.Expression != "(2+3)*4" {
		t.Errorf("expression = %q, want %q", resp.Expression, "(2+3)*4")
	}
}

func TestNewServer_CORS(t *testing.T) {
	srv := newServer()

	req := httptest.NewRequest(http.MethodOptions, "/api/calculate", nil)
	rr := httptest.NewRecorder()

	srv.ServeHTTP(rr, req)

	if rr.Code != http.StatusNoContent {
		t.Errorf("status = %d, want %d", rr.Code, http.StatusNoContent)
	}
	if got := rr.Header().Get("Access-Control-Allow-Origin"); got != "*" {
		t.Errorf("Access-Control-Allow-Origin = %q, want %q", got, "*")
	}
}

func TestNewServer_CalculateThenHistory(t *testing.T) {
	srv := newServer()

	// Perform a calculation
	calcReq := httptest.NewRequest(http.MethodPost, "/api/calculate",
		strings.NewReader(`{"operation":"multiply","a":6,"b":7}`))
	calcReq.Header.Set("Content-Type", "application/json")
	calcRR := httptest.NewRecorder()
	srv.ServeHTTP(calcRR, calcReq)

	if calcRR.Code != http.StatusOK {
		t.Fatalf("calculate status = %d, want %d", calcRR.Code, http.StatusOK)
	}

	// Fetch history
	histReq := httptest.NewRequest(http.MethodGet, "/api/history", nil)
	histRR := httptest.NewRecorder()
	srv.ServeHTTP(histRR, histReq)

	if histRR.Code != http.StatusOK {
		t.Fatalf("history status = %d, want %d", histRR.Code, http.StatusOK)
	}

	var entries []model.HistoryEntry
	if err := json.NewDecoder(histRR.Body).Decode(&entries); err != nil {
		t.Fatalf("decode error: %v", err)
	}

	if len(entries) != 1 {
		t.Fatalf("history len = %d, want 1", len(entries))
	}

	if entries[0].Operation != "multiply" {
		t.Errorf("operation = %q, want %q", entries[0].Operation, "multiply")
	}
	if entries[0].A == nil || *entries[0].A != 6 {
		t.Errorf("A = %v, want 6", entries[0].A)
	}
	if entries[0].B == nil || *entries[0].B != 7 {
		t.Errorf("B = %v, want 7", entries[0].B)
	}
	if entries[0].Result != 42 {
		t.Errorf("Result = %f, want 42", entries[0].Result)
	}
}

func TestNewServer_HistoryEmpty(t *testing.T) {
	srv := newServer()

	req := httptest.NewRequest(http.MethodGet, "/api/history", nil)
	rr := httptest.NewRecorder()
	srv.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", rr.Code, http.StatusOK)
	}

	var entries []model.HistoryEntry
	if err := json.NewDecoder(rr.Body).Decode(&entries); err != nil {
		t.Fatalf("decode error: %v", err)
	}
	if len(entries) != 0 {
		t.Errorf("history should be empty, got %d entries", len(entries))
	}
}

func TestNewServer_DeleteHistory(t *testing.T) {
	srv := newServer()

	// Add an entry
	calcReq := httptest.NewRequest(http.MethodPost, "/api/calculate",
		strings.NewReader(`{"operation":"add","a":1,"b":2}`))
	calcReq.Header.Set("Content-Type", "application/json")
	calcRR := httptest.NewRecorder()
	srv.ServeHTTP(calcRR, calcReq)

	// Delete history
	delReq := httptest.NewRequest(http.MethodDelete, "/api/history", nil)
	delRR := httptest.NewRecorder()
	srv.ServeHTTP(delRR, delReq)

	if delRR.Code != http.StatusOK {
		t.Fatalf("delete status = %d, want %d", delRR.Code, http.StatusOK)
	}

	// Verify empty
	histReq := httptest.NewRequest(http.MethodGet, "/api/history", nil)
	histRR := httptest.NewRecorder()
	srv.ServeHTTP(histRR, histReq)

	var entries []model.HistoryEntry
	if err := json.NewDecoder(histRR.Body).Decode(&entries); err != nil {
		t.Fatalf("decode error: %v", err)
	}
	if len(entries) != 0 {
		t.Errorf("history should be empty after DELETE, got %d entries", len(entries))
	}
}

func TestServe_GracefulShutdown(t *testing.T) {
	ln, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatalf("listen: %v", err)
	}

	ctx, cancel := context.WithCancel(context.Background())

	done := make(chan error, 1)
	go func() {
		done <- serve(ctx, ln)
	}()

	// Make a request to verify the server is working
	addr := ln.Addr().String()
	resp, err := http.Post("http://"+addr+"/api/calculate",
		"application/json",
		strings.NewReader(`{"operation":"multiply","a":6,"b":7}`))
	if err != nil {
		t.Fatalf("request error: %v", err)
	}
	resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		t.Errorf("status = %d, want %d", resp.StatusCode, http.StatusOK)
	}

	// Cancel context to trigger graceful shutdown
	cancel()

	if err := <-done; err != nil {
		t.Errorf("serve returned error: %v", err)
	}
}

func TestServe_ClosedListener(t *testing.T) {
	ln, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatalf("listen: %v", err)
	}
	// Close the listener before starting the server to trigger an error
	ln.Close()

	ctx := context.Background()
	if err := serve(ctx, ln); err == nil {
		t.Error("expected error from closed listener, got nil")
	}
}

func TestRun_Success(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())

	done := make(chan error, 1)
	go func() {
		done <- run(ctx, "127.0.0.1:0")
	}()

	// Give the server a moment to start, then shut it down
	cancel()

	if err := <-done; err != nil {
		t.Errorf("run returned error: %v", err)
	}
}

func TestRun_InvalidAddress(t *testing.T) {
	// Use an invalid address to trigger a listen error
	err := run(context.Background(), "invalid-address-no-port")
	if err == nil {
		t.Error("expected error for invalid address, got nil")
	}
}

func TestNewServer_MaxHistoryEnv(t *testing.T) {
	t.Setenv("MAX_HISTORY", "5")

	srv := newServer()

	// Add 7 entries
	for i := 0; i < 7; i++ {
		req := httptest.NewRequest(http.MethodPost, "/api/calculate",
			strings.NewReader(`{"operation":"add","a":1,"b":2}`))
		req.Header.Set("Content-Type", "application/json")
		rr := httptest.NewRecorder()
		srv.ServeHTTP(rr, req)
		if rr.Code != http.StatusOK {
			t.Fatalf("calculate status = %d, want %d", rr.Code, http.StatusOK)
		}
	}

	// Fetch history — should be capped at 5
	histReq := httptest.NewRequest(http.MethodGet, "/api/history", nil)
	histRR := httptest.NewRecorder()
	srv.ServeHTTP(histRR, histReq)

	var entries []model.HistoryEntry
	if err := json.NewDecoder(histRR.Body).Decode(&entries); err != nil {
		t.Fatalf("decode error: %v", err)
	}
	if len(entries) != 5 {
		t.Errorf("history len = %d, want 5 (MAX_HISTORY=5)", len(entries))
	}
}

func TestNewServer_HealthEndpoint(t *testing.T) {
	srv := newServer()

	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	rr := httptest.NewRecorder()
	srv.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", rr.Code, http.StatusOK)
	}

	var resp map[string]string
	if err := json.NewDecoder(rr.Body).Decode(&resp); err != nil {
		t.Fatalf("decode error: %v", err)
	}
	if resp["status"] != "ok" {
		t.Errorf("status = %q, want %q", resp["status"], "ok")
	}
}
