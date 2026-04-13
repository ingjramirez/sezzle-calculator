package engine

import (
	"errors"
	"math"
	"testing"
)

func TestCalculate(t *testing.T) {
	tests := []struct {
		name      string
		operation string
		a         float64
		b         float64
		want      float64
		wantErr   error
	}{
		// Normal operations
		{name: "add positive", operation: "add", a: 2, b: 3, want: 5},
		{name: "subtract positive", operation: "subtract", a: 10, b: 4, want: 6},
		{name: "multiply positive", operation: "multiply", a: 3, b: 7, want: 21},
		{name: "divide positive", operation: "divide", a: 20, b: 4, want: 5},

		// Negative numbers
		{name: "add negatives", operation: "add", a: -2, b: -3, want: -5},
		{name: "subtract negative from positive", operation: "subtract", a: 5, b: -3, want: 8},
		{name: "multiply negatives", operation: "multiply", a: -4, b: -5, want: 20},
		{name: "divide negative by positive", operation: "divide", a: -10, b: 2, want: -5},

		// Decimal numbers
		{name: "add decimals", operation: "add", a: 1.5, b: 2.3, want: 3.8},
		{name: "subtract decimals", operation: "subtract", a: 5.5, b: 2.2, want: 3.3},
		{name: "multiply decimals", operation: "multiply", a: 2.5, b: 4.0, want: 10.0},
		{name: "divide decimals", operation: "divide", a: 7.5, b: 2.5, want: 3.0},

		// Large numbers
		{name: "add large", operation: "add", a: 1e15, b: 2e15, want: 3e15},
		{name: "multiply large", operation: "multiply", a: 1e10, b: 1e10, want: 1e20},

		// Division by zero
		{name: "divide by zero", operation: "divide", a: 10, b: 0, wantErr: ErrDivisionByZero},

		// Unknown operation
		{name: "unknown operation", operation: "modulus", a: 10, b: 3, wantErr: ErrUnknownOperation},

		// Power
		{name: "power 2^3", operation: "power", a: 2, b: 3, want: 8},
		{name: "power 5^0", operation: "power", a: 5, b: 0, want: 1},
		{name: "power 2^-1", operation: "power", a: 2, b: -1, want: 0.5},
		{name: "power 10^2", operation: "power", a: 10, b: 2, want: 100},
		{name: "power 0^5", operation: "power", a: 0, b: 5, want: 0},

		// Mod
		{name: "mod 10%3", operation: "mod", a: 10, b: 3, want: 1},
		{name: "mod 7%2", operation: "mod", a: 7, b: 2, want: 1},
		{name: "mod 9%3", operation: "mod", a: 9, b: 3, want: 0},
		{name: "mod negative", operation: "mod", a: -10, b: 3, want: -1},
		{name: "mod by zero", operation: "mod", a: 10, b: 0, wantErr: ErrDivisionByZero},

		// Bitwise AND
		{name: "bitand 12 & 10", operation: "bitand", a: 12, b: 10, want: 8},
		{name: "bitand 0xFF & 0x0F", operation: "bitand", a: 0xFF, b: 0x0F, want: 15},
		{name: "bitand 0 & 123", operation: "bitand", a: 0, b: 123, want: 0},

		// Bitwise OR
		{name: "bitor 12 | 10", operation: "bitor", a: 12, b: 10, want: 14},
		{name: "bitor 0 | 5", operation: "bitor", a: 0, b: 5, want: 5},

		// Bitwise XOR
		{name: "bitxor 12 ^ 10", operation: "bitxor", a: 12, b: 10, want: 6},
		{name: "bitxor 5 ^ 5", operation: "bitxor", a: 5, b: 5, want: 0},

		// Left shift
		{name: "lshift 1 << 4", operation: "lshift", a: 1, b: 4, want: 16},
		{name: "lshift 3 << 2", operation: "lshift", a: 3, b: 2, want: 12},
		{name: "lshift negative shift", operation: "lshift", a: 1, b: -1, wantErr: ErrInvalidShift},
		{name: "lshift shift > 63", operation: "lshift", a: 1, b: 64, wantErr: ErrInvalidShift},

		// Right shift
		{name: "rshift 16 >> 4", operation: "rshift", a: 16, b: 4, want: 1},
		{name: "rshift 12 >> 2", operation: "rshift", a: 12, b: 2, want: 3},
		{name: "rshift negative shift", operation: "rshift", a: 16, b: -1, wantErr: ErrInvalidShift},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := Calculate(tt.operation, tt.a, tt.b)

			if tt.wantErr != nil {
				if err == nil {
					t.Fatalf("expected error %v, got nil", tt.wantErr)
				}
				if !errors.Is(err, tt.wantErr) {
					t.Fatalf("expected error %v, got %v", tt.wantErr, err)
				}
				return
			}

			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}

			if math.Abs(got-tt.want) > 1e-9 {
				t.Errorf("Calculate(%s, %f, %f) = %f, want %f", tt.operation, tt.a, tt.b, got, tt.want)
			}
		})
	}
}

func TestCalculateUnary(t *testing.T) {
	tests := []struct {
		name      string
		operation string
		a         float64
		want      float64
		wantErr   error
	}{
		// sqrt
		{name: "sqrt positive", operation: "sqrt", a: 16, want: 4},
		{name: "sqrt zero", operation: "sqrt", a: 0, want: 0},
		{name: "sqrt decimal", operation: "sqrt", a: 2, want: math.Sqrt(2)},
		{name: "sqrt negative", operation: "sqrt", a: -1, wantErr: ErrNegativeSquareRoot},

		// sin
		{name: "sin 0", operation: "sin", a: 0, want: 0},
		{name: "sin pi/2", operation: "sin", a: math.Pi / 2, want: 1},
		{name: "sin pi", operation: "sin", a: math.Pi, want: 0},

		// cos
		{name: "cos 0", operation: "cos", a: 0, want: 1},
		{name: "cos pi/2", operation: "cos", a: math.Pi / 2, want: 0},
		{name: "cos pi", operation: "cos", a: math.Pi, want: -1},

		// tan
		{name: "tan 0", operation: "tan", a: 0, want: 0},
		{name: "tan pi/4", operation: "tan", a: math.Pi / 4, want: 1},
		{name: "tan pi", operation: "tan", a: math.Pi, want: 0},

		// ln
		{name: "ln 1", operation: "ln", a: 1, want: 0},
		{name: "ln e", operation: "ln", a: math.E, want: 1},
		{name: "ln 10", operation: "ln", a: 10, want: math.Log(10)},
		{name: "ln zero", operation: "ln", a: 0, wantErr: ErrInvalidLogarithm},
		{name: "ln negative", operation: "ln", a: -5, wantErr: ErrInvalidLogarithm},

		// log10
		{name: "log10 1", operation: "log10", a: 1, want: 0},
		{name: "log10 10", operation: "log10", a: 10, want: 1},
		{name: "log10 100", operation: "log10", a: 100, want: 2},
		{name: "log10 zero", operation: "log10", a: 0, wantErr: ErrInvalidLogarithm},
		{name: "log10 negative", operation: "log10", a: -5, wantErr: ErrInvalidLogarithm},

		// factorial
		{name: "factorial 0", operation: "factorial", a: 0, want: 1},
		{name: "factorial 1", operation: "factorial", a: 1, want: 1},
		{name: "factorial 5", operation: "factorial", a: 5, want: 120},
		{name: "factorial 10", operation: "factorial", a: 10, want: 3628800},
		{name: "factorial negative", operation: "factorial", a: -1, wantErr: ErrInvalidFactorial},
		{name: "factorial non-integer", operation: "factorial", a: 3.5, wantErr: ErrInvalidFactorial},
		{name: "factorial 171 overflow", operation: "factorial", a: 171, wantErr: ErrInvalidFactorial},

		// square
		{name: "square 5", operation: "square", a: 5, want: 25},
		{name: "square 0", operation: "square", a: 0, want: 0},
		{name: "square negative", operation: "square", a: -3, want: 9},
		{name: "square decimal", operation: "square", a: 1.5, want: 2.25},

		// cube
		{name: "cube 3", operation: "cube", a: 3, want: 27},
		{name: "cube 0", operation: "cube", a: 0, want: 0},
		{name: "cube negative", operation: "cube", a: -2, want: -8},
		{name: "cube decimal", operation: "cube", a: 0.5, want: 0.125},

		// abs
		{name: "abs positive", operation: "abs", a: 5, want: 5},
		{name: "abs negative", operation: "abs", a: -5, want: 5},
		{name: "abs zero", operation: "abs", a: 0, want: 0},

		// reciprocal
		{name: "reciprocal 2", operation: "reciprocal", a: 2, want: 0.5},
		{name: "reciprocal 4", operation: "reciprocal", a: 4, want: 0.25},
		{name: "reciprocal negative", operation: "reciprocal", a: -5, want: -0.2},
		{name: "reciprocal zero", operation: "reciprocal", a: 0, wantErr: ErrDivisionByZero},

		// Bitwise NOT
		{name: "bitnot 0", operation: "bitnot", a: 0, want: -1},
		{name: "bitnot 1", operation: "bitnot", a: 1, want: -2},
		{name: "bitnot -1", operation: "bitnot", a: -1, want: 0},
		{name: "bitnot 255", operation: "bitnot", a: 255, want: -256},

		// Unknown unary operation
		{name: "unknown unary", operation: "notanop", a: 1, wantErr: ErrUnknownOperation},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := CalculateUnary(tt.operation, tt.a)

			if tt.wantErr != nil {
				if err == nil {
					t.Fatalf("expected error %v, got nil", tt.wantErr)
				}
				if !errors.Is(err, tt.wantErr) {
					t.Fatalf("expected error %v, got %v", tt.wantErr, err)
				}
				return
			}

			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}

			if math.Abs(got-tt.want) > 1e-9 {
				t.Errorf("CalculateUnary(%s, %f) = %f, want %f", tt.operation, tt.a, got, tt.want)
			}
		})
	}
}
