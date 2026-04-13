package handler

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/jaime-ramirez/sezzle-calculator/backend/internal/model"
)

func TestCalculateHandler(t *testing.T) {
	tests := []struct {
		name       string
		method     string
		body       string
		wantStatus int
		wantResult *float64
		wantError  string
	}{
		{
			name:       "add",
			method:     http.MethodPost,
			body:       `{"operation":"add","a":2,"b":3}`,
			wantStatus: http.StatusOK,
			wantResult: floatPtr(5),
		},
		{
			name:       "subtract",
			method:     http.MethodPost,
			body:       `{"operation":"subtract","a":10,"b":4}`,
			wantStatus: http.StatusOK,
			wantResult: floatPtr(6),
		},
		{
			name:       "multiply",
			method:     http.MethodPost,
			body:       `{"operation":"multiply","a":3,"b":7}`,
			wantStatus: http.StatusOK,
			wantResult: floatPtr(21),
		},
		{
			name:       "divide",
			method:     http.MethodPost,
			body:       `{"operation":"divide","a":20,"b":4}`,
			wantStatus: http.StatusOK,
			wantResult: floatPtr(5),
		},
		{
			name:       "division by zero",
			method:     http.MethodPost,
			body:       `{"operation":"divide","a":10,"b":0}`,
			wantStatus: http.StatusBadRequest,
			wantError:  "division by zero",
		},
		{
			name:       "missing operation",
			method:     http.MethodPost,
			body:       `{"a":1,"b":2}`,
			wantStatus: http.StatusBadRequest,
			wantError:  "operation is required",
		},
		{
			name:       "missing field a",
			method:     http.MethodPost,
			body:       `{"operation":"add","b":2}`,
			wantStatus: http.StatusBadRequest,
			wantError:  "field 'a' is required",
		},
		{
			name:       "missing field b for binary op uses unary",
			method:     http.MethodPost,
			body:       `{"operation":"sqrt","a":16}`,
			wantStatus: http.StatusOK,
			wantResult: floatPtr(4),
		},
		{
			name:       "unary sqrt negative error",
			method:     http.MethodPost,
			body:       `{"operation":"sqrt","a":-1}`,
			wantStatus: http.StatusBadRequest,
			wantError:  "square root of negative number",
		},
		{
			name:       "binary power",
			method:     http.MethodPost,
			body:       `{"operation":"power","a":2,"b":10}`,
			wantStatus: http.StatusOK,
			wantResult: floatPtr(1024),
		},
		{
			name:       "unary with B field present still works as binary",
			method:     http.MethodPost,
			body:       `{"operation":"power","a":3,"b":2}`,
			wantStatus: http.StatusOK,
			wantResult: floatPtr(9),
		},
		{
			name:       "bitwise AND binary",
			method:     http.MethodPost,
			body:       `{"operation":"bitand","a":12,"b":10}`,
			wantStatus: http.StatusOK,
			wantResult: floatPtr(8),
		},
		{
			name:       "bitwise NOT unary",
			method:     http.MethodPost,
			body:       `{"operation":"bitnot","a":0}`,
			wantStatus: http.StatusOK,
			wantResult: floatPtr(-1),
		},
		{
			name:       "invalid JSON",
			method:     http.MethodPost,
			body:       `{invalid}`,
			wantStatus: http.StatusBadRequest,
			wantError:  "invalid JSON",
		},
		{
			name:       "wrong method GET",
			method:     http.MethodGet,
			body:       ``,
			wantStatus: http.StatusMethodNotAllowed,
			wantError:  "method not allowed",
		},
		{
			name:       "wrong method PUT",
			method:     http.MethodPut,
			body:       `{"operation":"add","a":1,"b":2}`,
			wantStatus: http.StatusMethodNotAllowed,
			wantError:  "method not allowed",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(tt.method, "/api/calculate", bytes.NewBufferString(tt.body))
			req.Header.Set("Content-Type", "application/json")
			rr := httptest.NewRecorder()

			CalculateHandler(rr, req)

			if rr.Code != tt.wantStatus {
				t.Errorf("status = %d, want %d", rr.Code, tt.wantStatus)
			}

			if tt.wantResult != nil {
				var resp model.CalculateResponse
				if err := json.NewDecoder(rr.Body).Decode(&resp); err != nil {
					t.Fatalf("failed to decode response: %v", err)
				}
				if resp.Result != *tt.wantResult {
					t.Errorf("result = %f, want %f", resp.Result, *tt.wantResult)
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

func floatPtr(f float64) *float64 {
	return &f
}

func contains(s, substr string) bool {
	return len(s) >= len(substr) && searchSubstring(s, substr)
}

func searchSubstring(s, substr string) bool {
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return true
		}
	}
	return false
}
