package main

import (
	"context"
	"encoding/json"
	"net"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
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
