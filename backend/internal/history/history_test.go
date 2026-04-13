package history

import (
	"sync"
	"testing"
)

func TestAdd_And_List(t *testing.T) {
	s := NewStore(50)

	b1 := 3.0
	s.Add("add", 2, &b1, 5)

	b2 := 4.0
	s.Add("subtract", 10, &b2, 6)

	entries := s.List()
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

func TestAdd_UnaryOperation(t *testing.T) {
	s := NewStore(50)

	entry := s.Add("sqrt", 16, nil, 4)
	if entry.B != nil {
		t.Errorf("B should be nil for unary operation")
	}
	if entry.A != 16 {
		t.Errorf("A = %f, want 16", entry.A)
	}
	if entry.Result != 4 {
		t.Errorf("Result = %f, want 4", entry.Result)
	}
}

func TestAdd_MaxSize(t *testing.T) {
	s := NewStore(3)

	for i := 0; i < 5; i++ {
		b := float64(i)
		s.Add("add", float64(i), &b, float64(i*2))
	}

	entries := s.List()
	if len(entries) != 3 {
		t.Fatalf("len = %d, want 3", len(entries))
	}

	// Should have entries with A=2, A=3, A=4 (oldest two dropped), newest first
	if entries[0].A != 4 {
		t.Errorf("entries[0].A = %f, want 4", entries[0].A)
	}
	if entries[1].A != 3 {
		t.Errorf("entries[1].A = %f, want 3", entries[1].A)
	}
	if entries[2].A != 2 {
		t.Errorf("entries[2].A = %f, want 2", entries[2].A)
	}
}

func TestClear(t *testing.T) {
	s := NewStore(50)

	b := 3.0
	s.Add("add", 2, &b, 5)
	s.Add("multiply", 3, &b, 9)

	s.Clear()

	entries := s.List()
	if len(entries) != 0 {
		t.Fatalf("len = %d, want 0 after Clear", len(entries))
	}
}

func TestAutoIncrementIDs(t *testing.T) {
	s := NewStore(50)

	b := 1.0
	e1 := s.Add("add", 1, &b, 2)
	e2 := s.Add("add", 2, &b, 3)
	e3 := s.Add("add", 3, &b, 4)

	if e1.ID != 1 {
		t.Errorf("e1.ID = %d, want 1", e1.ID)
	}
	if e2.ID != 2 {
		t.Errorf("e2.ID = %d, want 2", e2.ID)
	}
	if e3.ID != 3 {
		t.Errorf("e3.ID = %d, want 3", e3.ID)
	}
}

func TestTimestampsAreSet(t *testing.T) {
	s := NewStore(50)

	b := 1.0
	entry := s.Add("add", 1, &b, 2)

	if entry.Timestamp == "" {
		t.Error("Timestamp should not be empty")
	}

	// Check that it looks like an RFC3339 timestamp
	if len(entry.Timestamp) < 20 {
		t.Errorf("Timestamp %q does not look like RFC3339", entry.Timestamp)
	}
}

func TestConcurrentAccess(t *testing.T) {
	s := NewStore(100)
	var wg sync.WaitGroup

	// Concurrent adds
	for i := 0; i < 50; i++ {
		wg.Add(1)
		go func(n int) {
			defer wg.Done()
			b := float64(n)
			s.Add("add", float64(n), &b, float64(n*2))
		}(i)
	}

	// Concurrent reads
	for i := 0; i < 20; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			s.List()
		}()
	}

	// Concurrent clears
	for i := 0; i < 5; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			s.Clear()
		}()
	}

	wg.Wait()

	// After all goroutines finish, the store should be in a valid state
	entries := s.List()
	if len(entries) > 100 {
		t.Errorf("len = %d, exceeds maxSize 100", len(entries))
	}
}

func TestList_ReturnsCopy(t *testing.T) {
	s := NewStore(50)

	b := 3.0
	s.Add("add", 2, &b, 5)

	list1 := s.List()
	list1[0].Operation = "modified"

	list2 := s.List()
	if list2[0].Operation == "modified" {
		t.Error("List() should return a copy, not a reference to internal state")
	}
}

func TestList_EmptyStore(t *testing.T) {
	s := NewStore(50)

	entries := s.List()
	if entries == nil {
		t.Fatal("List() should return non-nil empty slice")
	}
	if len(entries) != 0 {
		t.Errorf("len = %d, want 0", len(entries))
	}
}

func TestIDsContinueAfterClear(t *testing.T) {
	s := NewStore(50)

	b := 1.0
	s.Add("add", 1, &b, 2)
	s.Add("add", 2, &b, 3)

	s.Clear()

	e := s.Add("add", 3, &b, 4)
	if e.ID != 3 {
		t.Errorf("ID after clear = %d, want 3 (IDs should continue)", e.ID)
	}
}
