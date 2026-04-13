package engine

import (
	"errors"
	"math"
	"testing"
)

func TestEvaluate(t *testing.T) {
	tests := []struct {
		name    string
		expr    string
		want    float64
		wantErr error
	}{
		// Basic arithmetic
		{name: "add", expr: "2 + 3", want: 5},
		{name: "subtract", expr: "10 - 4", want: 6},
		{name: "multiply", expr: "3 * 7", want: 21},
		{name: "divide", expr: "15 / 3", want: 5},
		{name: "power", expr: "2 ^ 8", want: 256},

		// Operator precedence
		{name: "precedence add mul", expr: "2 + 3 * 4", want: 14},
		{name: "precedence sub mul", expr: "10 - 2 * 3", want: 4},
		{name: "precedence mul add mul", expr: "2 * 3 + 4 * 5", want: 26},
		{name: "power right assoc", expr: "2 ^ 3 ^ 2", want: 512},

		// Parentheses
		{name: "parens simple", expr: "(2 + 3) * 4", want: 20},
		{name: "parens double wrap", expr: "((2 + 3) * 4)", want: 20},
		{name: "parens two groups", expr: "(1 + 2) * (3 + 4)", want: 21},
		{name: "parens nested groups", expr: "((1 + 2) * (3 + 4))", want: 21},
		{name: "parens division", expr: "10 / (5 - 3)", want: 5},
		{name: "parens deep nesting", expr: "2 * (3 + (4 * 5))", want: 46},

		// Unary minus
		{name: "unary neg number", expr: "-5", want: -5},
		{name: "unary neg then add", expr: "-5 + 3", want: -2},
		{name: "unary neg in parens", expr: "(-5)", want: -5},
		{name: "multiply unary neg", expr: "3 * -2", want: -6},
		{name: "negate group", expr: "-(3 + 4)", want: -7},

		// Decimals
		{name: "decimal add", expr: "1.5 + 2.5", want: 4},
		{name: "float precision", expr: "0.1 + 0.2", want: 0.30000000000000004},

		// Edge cases
		{name: "single number", expr: "42", want: 42},
		{name: "whitespace", expr: "  2 +  3  ", want: 5},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := Evaluate(tt.expr)

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

			if math.Abs(got-tt.want) > 1e-12 {
				t.Errorf("Evaluate(%q) = %v, want %v", tt.expr, got, tt.want)
			}
		})
	}
}

func TestEvaluate_Errors(t *testing.T) {
	tests := []struct {
		name    string
		expr    string
		wantErr error
	}{
		{name: "empty string", expr: "", wantErr: ErrEmptyExpression},
		{name: "only spaces", expr: "   ", wantErr: ErrEmptyExpression},
		{name: "unmatched left paren", expr: "(2 + 3", wantErr: ErrMismatchedParens},
		{name: "unmatched right paren", expr: "2 + 3)", wantErr: ErrMismatchedParens},
		{name: "division by zero", expr: "2 / 0", wantErr: ErrDivisionByZero},
		{name: "consecutive operators", expr: "2 + + 3", wantErr: ErrConsecutiveOperators},
		{name: "invalid characters", expr: "abc", wantErr: ErrInvalidCharacter},
		{name: "trailing operator", expr: "2 + ", wantErr: ErrMalformedExpression},
		{name: "consecutive numbers", expr: "5 5", wantErr: ErrMalformedExpression},
		{name: "operator before close paren", expr: "(2 +)", wantErr: ErrMalformedExpression},
		{name: "multiple decimal points", expr: "1.2.3", wantErr: ErrInvalidCharacter},
		{name: "number then open paren", expr: "5(3)", wantErr: ErrMalformedExpression},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, err := Evaluate(tt.expr)
			if err == nil {
				t.Fatalf("expected error, got nil")
			}
			if !errors.Is(err, tt.wantErr) {
				t.Errorf("expected error %v, got %v", tt.wantErr, err)
			}
		})
	}
}

func TestTokenize(t *testing.T) {
	tokens, err := tokenize("3 + 4 * 2")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(tokens) != 5 {
		t.Fatalf("expected 5 tokens, got %d", len(tokens))
	}
	if tokens[0].val != "3" || tokens[0].typ != tokenNumber {
		t.Errorf("token[0] = %v, want number '3'", tokens[0])
	}
	if tokens[1].val != "+" || tokens[1].typ != tokenOperator {
		t.Errorf("token[1] = %v, want operator '+'", tokens[1])
	}
}

func TestTokenize_UnaryMinus(t *testing.T) {
	tokens, err := tokenize("-5")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(tokens) != 2 {
		t.Fatalf("expected 2 tokens, got %d", len(tokens))
	}
	if tokens[0].val != "neg" {
		t.Errorf("expected unary neg, got %q", tokens[0].val)
	}
}

func TestTokenize_UnaryMinusAfterOperator(t *testing.T) {
	tokens, err := tokenize("3 * -2")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(tokens) != 4 {
		t.Fatalf("expected 4 tokens, got %d", len(tokens))
	}
	if tokens[2].val != "neg" {
		t.Errorf("expected unary neg at index 2, got %q", tokens[2].val)
	}
}

func TestTokenize_UnaryMinusAfterLeftParen(t *testing.T) {
	tokens, err := tokenize("(-5)")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(tokens) != 4 {
		t.Fatalf("expected 4 tokens, got %d", len(tokens))
	}
	if tokens[1].val != "neg" {
		t.Errorf("expected unary neg at index 1, got %q", tokens[1].val)
	}
}

func TestPrecedence(t *testing.T) {
	if precedence("+") != 1 {
		t.Error("+ should have precedence 1")
	}
	if precedence("-") != 1 {
		t.Error("- should have precedence 1")
	}
	if precedence("*") != 2 {
		t.Error("* should have precedence 2")
	}
	if precedence("/") != 2 {
		t.Error("/ should have precedence 2")
	}
	if precedence("^") != 3 {
		t.Error("^ should have precedence 3")
	}
	if precedence("neg") != 4 {
		t.Error("neg should have precedence 4")
	}
	if precedence("unknown") != 0 {
		t.Error("unknown should have precedence 0")
	}
}

func TestIsRightAssociative(t *testing.T) {
	if !isRightAssociative("^") {
		t.Error("^ should be right-associative")
	}
	if !isRightAssociative("neg") {
		t.Error("neg should be right-associative")
	}
	if isRightAssociative("+") {
		t.Error("+ should not be right-associative")
	}
}

func TestIsOperator(t *testing.T) {
	ops := []string{"+", "-", "*", "/", "^"}
	for _, op := range ops {
		if !isOperator(op) {
			t.Errorf("%q should be an operator", op)
		}
	}
	if isOperator("neg") {
		t.Error("neg should not be classified as operator by isOperator")
	}
	if isOperator("x") {
		t.Error("x should not be an operator")
	}
}

func TestValidate_EmptyTokens(t *testing.T) {
	err := validate(nil)
	if !errors.Is(err, ErrEmptyExpression) {
		t.Errorf("expected ErrEmptyExpression, got %v", err)
	}
}

func TestShuntingYard_MismatchedLeftParen(t *testing.T) {
	tokens := []token{
		{typ: tokenLeftParen, val: "("},
		{typ: tokenNumber, val: "5"},
	}
	_, err := shuntingYard(tokens)
	if !errors.Is(err, ErrMismatchedParens) {
		t.Errorf("expected ErrMismatchedParens, got %v", err)
	}
}

func TestShuntingYard_MismatchedRightParen(t *testing.T) {
	tokens := []token{
		{typ: tokenNumber, val: "5"},
		{typ: tokenRightParen, val: ")"},
	}
	_, err := shuntingYard(tokens)
	if !errors.Is(err, ErrMismatchedParens) {
		t.Errorf("expected ErrMismatchedParens, got %v", err)
	}
}

func TestEvalRPN_EmptyStack(t *testing.T) {
	tokens := []token{
		{typ: tokenOperator, val: "+"},
	}
	_, err := evalRPN(tokens)
	if !errors.Is(err, ErrMalformedExpression) {
		t.Errorf("expected ErrMalformedExpression, got %v", err)
	}
}

func TestEvalRPN_UnaryOnEmptyStack(t *testing.T) {
	tokens := []token{
		{typ: tokenOperator, val: "neg"},
	}
	_, err := evalRPN(tokens)
	if !errors.Is(err, ErrMalformedExpression) {
		t.Errorf("expected ErrMalformedExpression, got %v", err)
	}
}

func TestEvalRPN_TooManyValues(t *testing.T) {
	tokens := []token{
		{typ: tokenNumber, val: "1"},
		{typ: tokenNumber, val: "2"},
	}
	_, err := evalRPN(tokens)
	if !errors.Is(err, ErrMalformedExpression) {
		t.Errorf("expected ErrMalformedExpression, got %v", err)
	}
}

func TestEvalRPN_InvalidNumber(t *testing.T) {
	tokens := []token{
		{typ: tokenNumber, val: "notanumber"},
	}
	_, err := evalRPN(tokens)
	if !errors.Is(err, ErrMalformedExpression) {
		t.Errorf("expected ErrMalformedExpression, got %v", err)
	}
}

func TestEvalRPN_UnknownOperator(t *testing.T) {
	tokens := []token{
		{typ: tokenNumber, val: "1"},
		{typ: tokenNumber, val: "2"},
		{typ: tokenOperator, val: "%"},
	}
	_, err := evalRPN(tokens)
	if !errors.Is(err, ErrMalformedExpression) {
		t.Errorf("expected ErrMalformedExpression, got %v", err)
	}
}
