package engine

import (
	"errors"
	"fmt"
	"math"
	"math/big"
	"strconv"
)

// ErrDivisionByZero is returned when dividing by zero.
var ErrDivisionByZero = errors.New("division by zero")

// ErrUnknownOperation is returned for unsupported operations.
var ErrUnknownOperation = errors.New("unknown operation")

// ErrNegativeSquareRoot is returned when taking the square root of a negative number.
var ErrNegativeSquareRoot = errors.New("square root of negative number")

// ErrInvalidLogarithm is returned when taking the logarithm of a non-positive number.
var ErrInvalidLogarithm = errors.New("logarithm of non-positive number")

// ErrInvalidFactorial is returned when factorial input is invalid.
var ErrInvalidFactorial = errors.New("invalid factorial input")

// ErrInvalidShift is returned when shift amount is out of range.
var ErrInvalidShift = errors.New("invalid shift amount")

// operationFunc defines the signature for a binary math operation.
type operationFunc func(a, b float64) (float64, error)

// unaryFunc defines the signature for a unary math operation.
type unaryFunc func(a float64) (float64, error)

// operations maps operation names to their implementations.
var operations = map[string]operationFunc{
	"add": func(a, b float64) (float64, error) {
		return a + b, nil
	},
	"subtract": func(a, b float64) (float64, error) {
		return a - b, nil
	},
	"multiply": func(a, b float64) (float64, error) {
		return a * b, nil
	},
	"divide": func(a, b float64) (float64, error) {
		if b == 0 {
			return 0, ErrDivisionByZero
		}
		return a / b, nil
	},
	"power": func(a, b float64) (float64, error) {
		return math.Pow(a, b), nil
	},
	"mod": func(a, b float64) (float64, error) {
		if b == 0 {
			return 0, ErrDivisionByZero
		}
		return math.Mod(a, b), nil
	},
	"bitand": func(a, b float64) (float64, error) {
		return float64(int64(a) & int64(b)), nil
	},
	"bitor": func(a, b float64) (float64, error) {
		return float64(int64(a) | int64(b)), nil
	},
	"bitxor": func(a, b float64) (float64, error) {
		return float64(int64(a) ^ int64(b)), nil
	},
	"lshift": func(a, b float64) (float64, error) {
		shift := int64(b)
		if shift < 0 || shift > 63 {
			return 0, fmt.Errorf("%w: %d", ErrInvalidShift, shift)
		}
		return float64(int64(a) << uint(shift)), nil
	},
	"rshift": func(a, b float64) (float64, error) {
		shift := int64(b)
		if shift < 0 || shift > 63 {
			return 0, fmt.Errorf("%w: %d", ErrInvalidShift, shift)
		}
		return float64(int64(a) >> uint(shift)), nil
	},
}

// unaryOperations maps operation names to their unary implementations.
var unaryOperations = map[string]unaryFunc{
	"sqrt": func(a float64) (float64, error) {
		if a < 0 {
			return 0, ErrNegativeSquareRoot
		}
		return math.Sqrt(a), nil
	},
	"sin": func(a float64) (float64, error) {
		return math.Sin(a), nil
	},
	"cos": func(a float64) (float64, error) {
		return math.Cos(a), nil
	},
	"tan": func(a float64) (float64, error) {
		return math.Tan(a), nil
	},
	"ln": func(a float64) (float64, error) {
		if a <= 0 {
			return 0, ErrInvalidLogarithm
		}
		return math.Log(a), nil
	},
	"log10": func(a float64) (float64, error) {
		if a <= 0 {
			return 0, ErrInvalidLogarithm
		}
		return math.Log10(a), nil
	},
	"factorial": func(a float64) (float64, error) {
		if a < 0 {
			return 0, fmt.Errorf("%w: negative number", ErrInvalidFactorial)
		}
		if a != math.Trunc(a) {
			return 0, fmt.Errorf("%w: non-integer", ErrInvalidFactorial)
		}
		n := int64(a)
		if n > 10000 {
			return 0, fmt.Errorf("%w: exceeds maximum (10000)", ErrInvalidFactorial)
		}
		result := new(big.Int).MulRange(1, n)
		f, _ := new(big.Float).SetInt(result).Float64()
		return f, nil // f will be +Inf for n > 170, which is fine
	},
	"square": func(a float64) (float64, error) {
		return a * a, nil
	},
	"cube": func(a float64) (float64, error) {
		return a * a * a, nil
	},
	"abs": func(a float64) (float64, error) {
		return math.Abs(a), nil
	},
	"reciprocal": func(a float64) (float64, error) {
		if a == 0 {
			return 0, ErrDivisionByZero
		}
		return 1 / a, nil
	},
	"bitnot": func(a float64) (float64, error) {
		return float64(^int64(a)), nil
	},
}

// Calculate performs the given binary operation on a and b.
func Calculate(operation string, a, b float64) (float64, error) {
	fn, ok := operations[operation]
	if !ok {
		return 0, fmt.Errorf("%w: %s", ErrUnknownOperation, operation)
	}
	return fn(a, b)
}

// CalculateUnary performs the given unary operation on a.
func CalculateUnary(operation string, a float64) (float64, error) {
	fn, ok := unaryOperations[operation]
	if !ok {
		return 0, fmt.Errorf("%w: %s", ErrUnknownOperation, operation)
	}
	return fn(a)
}

// FactorialBig computes n! and returns the result as a big.Int.
// Returns nil if n is negative or non-integer.
func FactorialBig(n int64) *big.Int {
	if n < 0 {
		return nil
	}
	if n == 0 {
		return big.NewInt(1)
	}
	return new(big.Int).MulRange(1, n)
}

// FormatBigNumber formats a big.Int as scientific notation if it's too large for normal display.
// Returns something like "4.02×10^2567" for huge numbers, or the plain number string for small ones.
func FormatBigNumber(n *big.Int) string {
	s := n.String()
	if len(s) <= 15 {
		return s
	}
	// Scientific notation: take first few significant digits
	exp := len(s) - 1
	// Format as "d.ddddd×10^exp"
	mantissa := s[0:1] + "." + s[1:6]
	return mantissa + "×10^" + strconv.Itoa(exp)
}
