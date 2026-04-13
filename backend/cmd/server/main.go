package main

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/jaime-ramirez/sezzle-calculator/backend/internal/handler"
	"github.com/jaime-ramirez/sezzle-calculator/backend/internal/history"
)

func newServer() http.Handler {
	maxHistory := 50
	if v := os.Getenv("MAX_HISTORY"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 {
			maxHistory = n
		}
	}
	store := history.NewStore(maxHistory)

	corsOrigin := os.Getenv("CORS_ORIGIN")
	if corsOrigin == "" {
		corsOrigin = "*"
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/api/calculate", handler.NewCalculateHandler(store))
	mux.HandleFunc("/api/evaluate", handler.NewEvaluateHandler(store))
	mux.HandleFunc("/api/history", handler.NewHistoryHandler(store))
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok"}`))
	})
	return handler.CORS(mux, corsOrigin)
}

// run starts the HTTP server on the given address and blocks until the
// context is cancelled or an unrecoverable error occurs.
func run(ctx context.Context, addr string) error {
	ln, err := net.Listen("tcp", addr)
	if err != nil {
		return fmt.Errorf("listen: %w", err)
	}
	log.Printf("Calculator API server starting on %s", ln.Addr())
	return serve(ctx, ln)
}

// serve starts the HTTP server on the given listener and blocks until the
// context is cancelled or an unrecoverable error occurs.
func serve(ctx context.Context, ln net.Listener) error {
	srv := &http.Server{
		Handler:      newServer(),
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  120 * time.Second,
	}
	go func() {
		<-ctx.Done()
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		srv.Shutdown(shutdownCtx)
	}()
	err := srv.Serve(ln)
	if errors.Is(err, http.ErrServerClosed) {
		return nil
	}
	return err
}

func main() {
	log.Fatal(run(context.Background(), ":8080"))
}
