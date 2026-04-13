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
