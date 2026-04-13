package engine

import (
	"errors"
	"fmt"
	"math"
	"strconv"
	"strings"
	"unicode"
)

// Expression evaluation errors.
var (
	ErrEmptyExpression      = errors.New("empty expression")
	ErrMismatchedParens     = errors.New("mismatched parentheses")
	ErrInvalidCharacter     = errors.New("invalid character")
	ErrMalformedExpression  = errors.New("malformed expression")
	ErrConsecutiveOperators = errors.New("consecutive operators without operand")
	ErrShiftOutOfRange      = errors.New("shift amount must be 0-63")
)

// tokenType classifies tokens produced by the tokenizer.
type tokenType int

const (
	tokenNumber tokenType = iota
	tokenOperator
	tokenLeftParen
	tokenRightParen
)

// token represents a single token in the expression.
type token struct {
	typ tokenType
	val string
}

// precedence returns the operator precedence.
func precedence(op string) int {
	switch op {
	case "&", "|":
		return 0
	case "<<", ">>":
		return 1
	case "+", "-":
		return 2
	case "*", "/", "%":
		return 3
	case "^":
		return 4
	case "neg":
		return 5
	default:
		return -1
	}
}

// isRightAssociative returns true for right-associative operators.
func isRightAssociative(op string) bool {
	return op == "^" || op == "neg"
}

// isOperator returns true if the string is a binary operator.
func isOperator(s string) bool {
	return s == "+" || s == "-" || s == "*" || s == "/" || s == "^" ||
		s == "&" || s == "|" || s == "%" || s == "<<" || s == ">>"
}

// tokenize splits an expression string into tokens.
func tokenize(expression string) ([]token, error) {
	var tokens []token
	i := 0
	runes := []rune(expression)

	for i < len(runes) {
		ch := runes[i]

		// Skip whitespace
		if unicode.IsSpace(ch) {
			i++
			continue
		}

		// Number (digit or decimal point starting a number)
		if unicode.IsDigit(ch) || (ch == '.' && i+1 < len(runes) && unicode.IsDigit(runes[i+1])) {
			start := i
			hasDot := false
			for i < len(runes) && (unicode.IsDigit(runes[i]) || runes[i] == '.') {
				if runes[i] == '.' {
					if hasDot {
						return nil, fmt.Errorf("%w: multiple decimal points", ErrInvalidCharacter)
					}
					hasDot = true
				}
				i++
			}
			tokens = append(tokens, token{typ: tokenNumber, val: string(runes[start:i])})
			continue
		}

		// Operator or parenthesis
		switch ch {
		case '(':
			tokens = append(tokens, token{typ: tokenLeftParen, val: "("})
			i++
		case ')':
			tokens = append(tokens, token{typ: tokenRightParen, val: ")"})
			i++
		case '+', '-', '*', '/', '^', '&', '|', '%':
			// Check if minus is unary
			if ch == '-' {
				isUnary := len(tokens) == 0 ||
					tokens[len(tokens)-1].typ == tokenLeftParen ||
					tokens[len(tokens)-1].typ == tokenOperator
				if isUnary {
					tokens = append(tokens, token{typ: tokenOperator, val: "neg"})
					i++
					continue
				}
			}
			tokens = append(tokens, token{typ: tokenOperator, val: string(ch)})
			i++
		case '<':
			if i+1 < len(runes) && runes[i+1] == '<' {
				tokens = append(tokens, token{typ: tokenOperator, val: "<<"})
				i += 2
			} else {
				return nil, fmt.Errorf("%w: '%c'", ErrInvalidCharacter, ch)
			}
		case '>':
			if i+1 < len(runes) && runes[i+1] == '>' {
				tokens = append(tokens, token{typ: tokenOperator, val: ">>"})
				i += 2
			} else {
				return nil, fmt.Errorf("%w: '%c'", ErrInvalidCharacter, ch)
			}
		default:
			return nil, fmt.Errorf("%w: '%c'", ErrInvalidCharacter, ch)
		}
	}

	return tokens, nil
}

// validate checks token sequences for malformed expressions.
func validate(tokens []token) error {
	if len(tokens) == 0 {
		return ErrEmptyExpression
	}

	parenDepth := 0
	for i, tok := range tokens {
		switch tok.typ {
		case tokenLeftParen:
			parenDepth++
		case tokenRightParen:
			parenDepth--
			if parenDepth < 0 {
				return ErrMismatchedParens
			}
		case tokenOperator:
			if tok.val != "neg" {
				// Binary operator: must not appear at the end
				if i == len(tokens)-1 {
					return fmt.Errorf("%w: trailing operator '%s'", ErrMalformedExpression, tok.val)
				}
				// Binary operator: next token must not be another binary operator
				next := tokens[i+1]
				if next.typ == tokenOperator && next.val != "neg" {
					return ErrConsecutiveOperators
				}
				// Binary operator: next token must not be a right paren
				if next.typ == tokenRightParen {
					return fmt.Errorf("%w: operator '%s' before ')'", ErrMalformedExpression, tok.val)
				}
			} else {
				// Unary neg: must not appear at the end
				if i == len(tokens)-1 {
					return fmt.Errorf("%w: trailing unary minus", ErrMalformedExpression)
				}
			}
		case tokenNumber:
			// A number followed directly by another number is invalid (e.g., "5 5")
			if i+1 < len(tokens) && tokens[i+1].typ == tokenNumber {
				return fmt.Errorf("%w: consecutive numbers", ErrMalformedExpression)
			}
			// A number followed by a left paren is invalid (e.g., "5(3)")
			if i+1 < len(tokens) && tokens[i+1].typ == tokenLeftParen {
				return fmt.Errorf("%w: number followed by '('", ErrMalformedExpression)
			}
		}
	}

	if parenDepth != 0 {
		return ErrMismatchedParens
	}

	// Check that the last token makes sense
	last := tokens[len(tokens)-1]
	if last.typ == tokenOperator {
		return fmt.Errorf("%w: expression ends with operator", ErrMalformedExpression)
	}

	return nil
}

// shuntingYard converts a list of infix tokens to reverse Polish notation (postfix).
func shuntingYard(tokens []token) ([]token, error) {
	var output []token
	var opStack []token

	for _, tok := range tokens {
		switch tok.typ {
		case tokenNumber:
			output = append(output, tok)

		case tokenOperator:
			for len(opStack) > 0 {
				top := opStack[len(opStack)-1]
				if top.typ == tokenLeftParen {
					break
				}
				topPrec := precedence(top.val)
				tokPrec := precedence(tok.val)
				if topPrec > tokPrec || (topPrec == tokPrec && !isRightAssociative(tok.val)) {
					output = append(output, top)
					opStack = opStack[:len(opStack)-1]
				} else {
					break
				}
			}
			opStack = append(opStack, tok)

		case tokenLeftParen:
			opStack = append(opStack, tok)

		case tokenRightParen:
			foundLeft := false
			for len(opStack) > 0 {
				top := opStack[len(opStack)-1]
				opStack = opStack[:len(opStack)-1]
				if top.typ == tokenLeftParen {
					foundLeft = true
					break
				}
				output = append(output, top)
			}
			if !foundLeft {
				return nil, ErrMismatchedParens
			}
		}
	}

	// Pop remaining operators
	for len(opStack) > 0 {
		top := opStack[len(opStack)-1]
		opStack = opStack[:len(opStack)-1]
		if top.typ == tokenLeftParen {
			return nil, ErrMismatchedParens
		}
		output = append(output, top)
	}

	return output, nil
}

// evalRPN evaluates a list of tokens in reverse Polish notation.
func evalRPN(tokens []token) (float64, error) {
	var stack []float64

	for _, tok := range tokens {
		switch tok.typ {
		case tokenNumber:
			val, err := strconv.ParseFloat(tok.val, 64)
			if err != nil {
				return 0, fmt.Errorf("%w: invalid number '%s'", ErrMalformedExpression, tok.val)
			}
			stack = append(stack, val)

		case tokenOperator:
			if tok.val == "neg" {
				if len(stack) < 1 {
					return 0, ErrMalformedExpression
				}
				stack[len(stack)-1] = -stack[len(stack)-1]
			} else {
				if len(stack) < 2 {
					return 0, ErrMalformedExpression
				}
				b := stack[len(stack)-1]
				a := stack[len(stack)-2]
				stack = stack[:len(stack)-2]

				var result float64
				switch tok.val {
				case "+":
					result = a + b
				case "-":
					result = a - b
				case "*":
					result = a * b
				case "/":
					if b == 0 {
						return 0, ErrDivisionByZero
					}
					result = a / b
				case "^":
					result = math.Pow(a, b)
				case "&":
					result = float64(int64(a) & int64(b))
				case "|":
					result = float64(int64(a) | int64(b))
				case "%":
					if b == 0 {
						return 0, ErrDivisionByZero
					}
					result = math.Mod(a, b)
				case "<<":
					if b < 0 || b > 63 {
						return 0, ErrShiftOutOfRange
					}
					result = float64(int64(a) << uint(int64(b)))
				case ">>":
					if b < 0 || b > 63 {
						return 0, ErrShiftOutOfRange
					}
					result = float64(int64(a) >> uint(int64(b)))
				default:
					return 0, fmt.Errorf("%w: unknown operator '%s'", ErrMalformedExpression, tok.val)
				}
				stack = append(stack, result)
			}
		}
	}

	if len(stack) != 1 {
		return 0, ErrMalformedExpression
	}

	return stack[0], nil
}

// Evaluate parses and evaluates a mathematical expression string.
// Supports: +, -, *, /, ^, (, ), and unary minus.
// Returns the result or an error.
func Evaluate(expression string) (float64, error) {
	trimmed := strings.TrimSpace(expression)
	if trimmed == "" {
		return 0, ErrEmptyExpression
	}

	tokens, err := tokenize(trimmed)
	if err != nil {
		return 0, err
	}

	if err := validate(tokens); err != nil {
		return 0, err
	}

	rpn, err := shuntingYard(tokens)
	if err != nil {
		return 0, err
	}

	return evalRPN(rpn)
}
