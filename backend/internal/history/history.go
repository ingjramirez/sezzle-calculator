package history

import (
	"sync"
	"time"

	"github.com/jaime-ramirez/sezzle-calculator/backend/internal/model"
)

// Store is a thread-safe, in-memory store for calculation history entries.
type Store struct {
	mu      sync.RWMutex
	entries []model.HistoryEntry
	nextID  int
	maxSize int
}

// NewStore creates a new Store that keeps at most maxSize entries.
func NewStore(maxSize int) *Store {
	return &Store{
		entries: make([]model.HistoryEntry, 0),
		nextID:  1,
		maxSize: maxSize,
	}
}

// Add adds a new entry and returns it (with ID and timestamp set).
func (s *Store) Add(operation string, a float64, b *float64, result float64) model.HistoryEntry {
	s.mu.Lock()
	defer s.mu.Unlock()

	entry := model.HistoryEntry{
		ID:        s.nextID,
		Operation: operation,
		A:         a,
		B:         b,
		Result:    result,
		Timestamp: time.Now().UTC().Format(time.RFC3339),
	}
	s.nextID++

	s.entries = append(s.entries, entry)

	// Trim to maxSize (drop oldest)
	if len(s.entries) > s.maxSize {
		s.entries = s.entries[len(s.entries)-s.maxSize:]
	}

	return entry
}

// List returns all entries newest first.
func (s *Store) List() []model.HistoryEntry {
	s.mu.RLock()
	defer s.mu.RUnlock()

	result := make([]model.HistoryEntry, len(s.entries))
	for i, e := range s.entries {
		result[len(s.entries)-1-i] = e
	}
	return result
}

// Clear removes all entries.
func (s *Store) Clear() {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.entries = make([]model.HistoryEntry, 0)
}
