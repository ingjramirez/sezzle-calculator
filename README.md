# Sezzle Calculator

A full-stack calculator application with a React + TypeScript frontend and Go REST API backend.

## Features

- **Basic Calculator** — Addition, subtraction, multiplication, division with parentheses
- **Scientific Calculator** — Trigonometry (sin, cos, tan), logarithms (ln, log), square root, exponentiation, factorial (up to 10000! via big.Int), reciprocal, constants (pi, e)
- **Programmer Calculator** — Bitwise operations (AND, OR, XOR, NOT), bit shifts (<<, >>), base conversion display (HEX, DEC, OCT, BIN)
- **Parentheses** — Full expression support with proper operator precedence via shunting-yard algorithm
- **Calculation History** — Inline history in the display area, click any entry to load its result, clear history button
- **Big Number Support** — Factorials beyond 170 use big.Int with scientific notation display (e.g., 200! = 7.88657×10^374)
- **Base Conversion** — Programmer mode displays values in hex (0x), octal (0o), binary (0b), or decimal
- **Unified Grid Layout** — Scientific and programmer buttons appear as extra left columns in a single grid that widens horizontally
- **Keyboard Support** — Type digits, operators, parentheses, Enter for equals, Escape to clear
- **Input Validation** — Handles division by zero, mismatched parentheses, invalid input, and edge cases
- **Responsive Design** — Works on desktop and mobile
- **Dark Theme** — Clean, modern calculator aesthetic with distinct color themes per mode (indigo for scientific, teal for programmer)

## Architecture

```
├── backend/             # Go REST API
│   ├── cmd/server/      # Entry point with graceful shutdown
│   └── internal/
│       ├── engine/      # Math operations + expression evaluator (shunting-yard)
│       ├── handler/     # HTTP handlers (calculate, evaluate, history) + CORS
│       ├── history/     # Thread-safe in-memory history store
│       └── model/       # Request/response types
├── frontend/            # React + TypeScript + Tailwind CSS v4
│   └── src/
│       ├── components/  # Calculator, Display, ButtonGrid, ScientificButtonGrid, etc.
│       ├── hooks/       # useCalculator reducer hook (expression token tracking)
│       ├── services/    # API client (calculate, evaluate, history)
│       └── types/       # TypeScript type definitions
└── docker-compose.yml   # Run both services together
```

### Design Decisions

- **Separated engine from handler** — The math engine is a pure function layer with no HTTP concerns, making it easy to test and extend with new operations.
- **Map-based operation dispatch** — Binary and unary operations are registered in maps, so adding new ones requires only a map entry.
- **Shunting-yard expression evaluator** — Supports parenthesized expressions with proper operator precedence and associativity. Used when parentheses are present; simple a-op-b path used otherwise.
- **Big integer factorial** — Uses Go's `math/big.Int` for exact factorial computation up to 10000!. Results too large for float64 are formatted as scientific notation in a `resultDisplay` response field.
- **useReducer with expression tokens** — Calculator state tracks expression tokens alongside traditional calculator state, enabling both simple and expression-based evaluation modes.
- **Thread-safe history store** — In-memory store with RWMutex, auto-incrementing IDs, max 50 entries, newest-first ordering.
- **Unified grid layout** — Scientific and programmer modes widen the grid (7 and 6 columns respectively) instead of stacking rows vertically, keeping the calculator compact.
- **Backend computes results** — The frontend sends operands/expressions to the API, which performs the calculation. This keeps the backend as the source of truth.
- **Standard library only (Go)** — Zero external dependencies. Uses `math/big` for large factorials.
- **Vite proxy for dev** — During development, Vite proxies `/api` requests to the Go backend, avoiding CORS issues.

## Setup

### Prerequisites

- **Go** 1.22+ (`brew install go`)
- **Node.js** 18+ with npm
- **Docker** (optional, for containerized deployment)

### Local Development

**Backend:**

```bash
cd backend
go run ./cmd/server
# Server starts on http://localhost:8080
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
# App starts on http://localhost:5173, proxies /api to :8080
```

### Docker (Full Stack)

```bash
docker compose up --build
# Frontend: http://localhost:3000
# Backend:  http://localhost:8080
```

## API Reference

### `POST /api/calculate`

Performs a single operation on one or two numbers.

**Binary request (two operands):**
```json
{
  "operation": "add",
  "a": 10,
  "b": 5
}
```

**Unary request (one operand):**
```json
{
  "operation": "factorial",
  "a": 200
}
```

**Response (200):**
```json
{
  "result": 15,
  "operation": "add"
}
```

**Big number response (200) — when result exceeds float64:**
```json
{
  "result": 0,
  "resultDisplay": "7.88657×10^374",
  "operation": "factorial"
}
```

### `POST /api/evaluate`

Evaluates a math expression string with operator precedence and parentheses.

**Request:**
```json
{
  "expression": "(2 + 3) * 4"
}
```

**Response (200):**
```json
{
  "result": 20,
  "expression": "(2 + 3) * 4"
}
```

### `GET /api/history`

Returns the calculation history (newest first, max 50 entries).

**Response (200):**
```json
[
  {
    "id": 2,
    "operation": "add",
    "a": 5,
    "b": 3,
    "result": 8,
    "timestamp": "2026-04-13T08:00:00Z"
  },
  {
    "id": 1,
    "operation": "expression",
    "a": 0,
    "result": 20,
    "expression": "(2 + 3) * 4",
    "timestamp": "2026-04-13T07:59:00Z"
  }
]
```

### `DELETE /api/history`

Clears all history entries.

#### Supported Operations

**Basic (binary — requires `a` and `b`):**

| Operation    | Description            | Example              |
|-------------|------------------------|----------------------|
| `add`       | Addition               | `10 + 5 = 15`       |
| `subtract`  | Subtraction            | `10 - 5 = 5`        |
| `multiply`  | Multiplication         | `10 * 5 = 50`       |
| `divide`    | Division               | `10 / 5 = 2`        |
| `power`     | Exponentiation         | `2 ^ 10 = 1024`     |
| `mod`       | Modulo                 | `10 % 3 = 1`        |

**Programmer (binary — requires `a` and `b`):**

| Operation    | Description            | Example              |
|-------------|------------------------|----------------------|
| `bitand`    | Bitwise AND            | `12 & 10 = 8`       |
| `bitor`     | Bitwise OR             | `12 \| 10 = 14`     |
| `bitxor`    | Bitwise XOR            | `12 ^ 10 = 6`       |
| `lshift`    | Left shift             | `1 << 4 = 16`       |
| `rshift`    | Right shift            | `16 >> 4 = 1`       |

**Scientific (unary — only requires `a`, omit `b`):**

| Operation    | Description            | Example              |
|-------------|------------------------|----------------------|
| `sqrt`      | Square root            | `sqrt(16) = 4`      |
| `square`    | Square                 | `5² = 25`           |
| `cube`      | Cube                   | `3³ = 27`           |
| `sin`       | Sine (radians)         | `sin(0) = 0`        |
| `cos`       | Cosine (radians)       | `cos(0) = 1`        |
| `tan`       | Tangent (radians)      | `tan(0) = 0`        |
| `ln`        | Natural logarithm      | `ln(e) = 1`         |
| `log10`     | Base-10 logarithm      | `log10(100) = 2`    |
| `factorial` | Factorial (big.Int)    | `200! = 7.88657×10^374` |
| `reciprocal`| Reciprocal (1/x)       | `1/4 = 0.25`        |
| `abs`       | Absolute value         | `abs(-5) = 5`       |
| `bitnot`    | Bitwise NOT            | `~0 = -1`           |

**Expression evaluation (via `/api/evaluate`):**
- Supports: `+`, `-`, `*`, `/`, `^`, `(`, `)`, unary minus
- Proper operator precedence (PEMDAS)
- Right-associative exponentiation: `2^3^2 = 512`

#### Error Cases

- Division by zero → `400`
- Mismatched parentheses → `400`
- Square root of negative number → `400`
- Logarithm of non-positive number → `400`
- Invalid factorial (negative, non-integer, >10000) → `400`
- Invalid shift amount (<0 or >63) → `400`
- Empty expression → `400`
- Invalid characters in expression → `400`
- Missing required fields → `400`
- Invalid JSON → `400`
- Unknown operation → `400`
- Wrong HTTP method → `405`

## Testing

**Backend:**
```bash
cd backend
go test ./... -v
```

**Frontend:**
```bash
cd frontend
npm test              # run tests
npm run test:coverage # run with coverage report
```

### Test Coverage

**Backend:** 100+ tests across 5 packages
- `engine` — All operations, expression evaluator, big factorial, edge cases (98.6%)
- `handler` — Calculate, evaluate, history handlers (100%)
- `history` — Thread-safe store, AddExpression, max size (100%)
- `cmd/server` — Integration tests including graceful shutdown (95%)

**Frontend:** 203 tests across 12 test files
- Statements: 100%
- Functions: 100%
- Lines: 100%

## Future Enhancements

- **Hex Digit Input** — A-F buttons in programmer mode for hex input
- **Degree/Radian Toggle** — Switch between degree and radian mode for trig functions
- **Persistent History** — Save history to database or localStorage
