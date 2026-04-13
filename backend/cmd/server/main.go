package main

import (
	"context"
	"fmt"
	"log"
	"net"
	"net/http"

	"github.com/jaime-ramirez/sezzle-calculator/backend/internal/handler"
	"github.com/jaime-ramirez/sezzle-calculator/backend/internal/history"
)

func newServer() http.Handler {
	store := history.NewStore(50)
	mux := http.NewServeMux()
	mux.HandleFunc("/api/calculate", handler.NewCalculateHandler(store))
	mux.HandleFunc("/api/evaluate", handler.NewEvaluateHandler(store))
	mux.HandleFunc("/api/history", handler.NewHistoryHandler(store))
	return handler.CORS(mux)
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
	srv := &http.Server{Handler: newServer()}
	go func() {
		<-ctx.Done()
		srv.Close()
	}()
	err := srv.Serve(ln)
	if err == http.ErrServerClosed {
		return nil
	}
	return err
}

func main() {
	log.Fatal(run(context.Background(), ":8080"))
}
