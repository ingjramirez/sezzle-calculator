package model

// CalculateRequest represents an incoming calculation request.
type CalculateRequest struct {
	Operation string   `json:"operation"`
	A         *float64 `json:"a"`
	B         *float64 `json:"b,omitempty"`
}

// CalculateResponse represents the result of a calculation.
type CalculateResponse struct {
	Result    float64 `json:"result"`
	Operation string  `json:"operation"`
}

// ErrorResponse represents an error returned to the client.
type ErrorResponse struct {
	Error string `json:"error"`
}

// EvaluateRequest represents a request to evaluate a math expression.
type EvaluateRequest struct {
	Expression string `json:"expression"`
}

// EvaluateResponse represents the result of evaluating a math expression.
type EvaluateResponse struct {
	Result     float64 `json:"result"`
	Expression string  `json:"expression"`
}

// HistoryEntry represents a single calculation stored in history.
type HistoryEntry struct {
	ID         int      `json:"id"`
	Operation  string   `json:"operation"`
	A          float64  `json:"a"`
	B          *float64 `json:"b,omitempty"`
	Result     float64  `json:"result"`
	Expression string   `json:"expression,omitempty"`
	Timestamp  string   `json:"timestamp"`
}
