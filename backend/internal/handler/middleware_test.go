package handler

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestCORS_Preflight(t *testing.T) {
	inner := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		t.Error("inner handler should not be called for OPTIONS")
	})

	handler := CORS(inner)
	req := httptest.NewRequest(http.MethodOptions, "/api/calculate", nil)
	rr := httptest.NewRecorder()

	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusNoContent {
		t.Errorf("status = %d, want %d", rr.Code, http.StatusNoContent)
	}
	if got := rr.Header().Get("Access-Control-Allow-Origin"); got != "*" {
		t.Errorf("Access-Control-Allow-Origin = %q, want %q", got, "*")
	}
	if got := rr.Header().Get("Access-Control-Allow-Methods"); got != "GET, POST, DELETE, OPTIONS" {
		t.Errorf("Access-Control-Allow-Methods = %q, want %q", got, "GET, POST, DELETE, OPTIONS")
	}
	if got := rr.Header().Get("Access-Control-Allow-Headers"); got != "Content-Type" {
		t.Errorf("Access-Control-Allow-Headers = %q, want %q", got, "Content-Type")
	}
}

func TestCORS_PassThrough(t *testing.T) {
	called := false
	inner := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		called = true
		w.WriteHeader(http.StatusOK)
	})

	handler := CORS(inner)
	req := httptest.NewRequest(http.MethodPost, "/api/calculate", nil)
	rr := httptest.NewRecorder()

	handler.ServeHTTP(rr, req)

	if !called {
		t.Error("inner handler was not called for POST request")
	}
	if rr.Code != http.StatusOK {
		t.Errorf("status = %d, want %d", rr.Code, http.StatusOK)
	}
	if got := rr.Header().Get("Access-Control-Allow-Origin"); got != "*" {
		t.Errorf("Access-Control-Allow-Origin = %q, want %q", got, "*")
	}
}
