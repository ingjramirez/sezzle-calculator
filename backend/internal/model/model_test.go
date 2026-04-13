package model

import (
	"encoding/json"
	"testing"
)

func TestCalculateRequest_JSON(t *testing.T) {
	a := 5.0
	b := 3.0
	req := CalculateRequest{Operation: "add", A: &a, B: &b}

	data, err := json.Marshal(req)
	if err != nil {
		t.Fatalf("marshal error: %v", err)
	}

	var decoded CalculateRequest
	if err := json.Unmarshal(data, &decoded); err != nil {
		t.Fatalf("unmarshal error: %v", err)
	}

	if decoded.Operation != "add" {
		t.Errorf("operation = %q, want %q", decoded.Operation, "add")
	}
	if decoded.A == nil || *decoded.A != 5.0 {
		t.Errorf("a = %v, want 5.0", decoded.A)
	}
	if decoded.B == nil || *decoded.B != 3.0 {
		t.Errorf("b = %v, want 3.0", decoded.B)
	}
}

func TestCalculateRequest_OmitB(t *testing.T) {
	a := 4.0
	req := CalculateRequest{Operation: "sqrt", A: &a}

	data, err := json.Marshal(req)
	if err != nil {
		t.Fatalf("marshal error: %v", err)
	}

	// B should be omitted from JSON
	var raw map[string]interface{}
	if err := json.Unmarshal(data, &raw); err != nil {
		t.Fatalf("unmarshal error: %v", err)
	}
	if _, ok := raw["b"]; ok {
		t.Error("field 'b' should be omitted when nil")
	}
}

func TestCalculateResponse_JSON(t *testing.T) {
	resp := CalculateResponse{Result: 42.0, Operation: "add"}

	data, err := json.Marshal(resp)
	if err != nil {
		t.Fatalf("marshal error: %v", err)
	}

	var decoded CalculateResponse
	if err := json.Unmarshal(data, &decoded); err != nil {
		t.Fatalf("unmarshal error: %v", err)
	}

	if decoded.Result != 42.0 {
		t.Errorf("result = %f, want 42.0", decoded.Result)
	}
	if decoded.Operation != "add" {
		t.Errorf("operation = %q, want %q", decoded.Operation, "add")
	}
}

func TestErrorResponse_JSON(t *testing.T) {
	resp := ErrorResponse{Error: "something went wrong"}

	data, err := json.Marshal(resp)
	if err != nil {
		t.Fatalf("marshal error: %v", err)
	}

	var decoded ErrorResponse
	if err := json.Unmarshal(data, &decoded); err != nil {
		t.Fatalf("unmarshal error: %v", err)
	}

	if decoded.Error != "something went wrong" {
		t.Errorf("error = %q, want %q", decoded.Error, "something went wrong")
	}
}
