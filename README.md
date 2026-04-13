# Sezzle Calculator

A full-stack calculator application with a React + TypeScript frontend and Go REST API backend.

## Features

- **Basic Calculator** — Addition, subtraction, multiplication, division
- **Scientific Calculator** — Trigonometry (sin, cos, tan), logarithms (ln, log), square root, exponentiation, factorial, reciprocal, constants (pi, e)
- **Programmer Calculator** — Bitwise operations (AND, OR, XOR, NOT), bit shifts (<<, >>), base conversion display (HEX, DEC, OCT, BIN)
- **Mode Switcher** — Tabs to switch between Basic, Scientific, and Programmer modes
- **Expression Display** — Shows the current operation in progress
- **Base Conversion** — Programmer mode displays values in hex (0x), octal (0o), binary (0b), or decimal
- **Input Validation** — Handles division by zero, invalid input, and edge cases
- **Responsive Design** — Works on desktop and mobile
- **Dark Theme** — Clean, modern calculator aesthetic with distinct color themes per mode

## Architecture

```
├── backend/             # Go REST API
│   ├── cmd/server/      # Entry point
│   └── internal/
│       ├── engine/      # Math operations (pure logic, no HTTP)
│       ├── handler/     # HTTP handlers + CORS middleware
│       └── model/       # Request/response types
├── frontend/            # React + TypeScript + Tailwind
│   └── src/
│       ├── components/  # UI components (Calculator, Display, Button, etc.)
│       ├── hooks/       # useCalculator reducer hook
│       ├── services/    # API client
│       └── types/       # TypeScript type definitions
└── docker-compose.yml   # Run both services together
```

### Design Decisions

- **Separated engine from handler** — The math engine is a pure function layer with no HTTP concerns, making it easy to test and extend with new operations.
- **Map-based operation dispatch** — Operations are registered in a map, so adding new ones (e.g., exponentiation, modulo) requires only adding a map entry.
- **useReducer for state** — Calculator state transitions are complex enough to warrant a reducer, but simple enough to avoid external state libraries.
- **Backend computes results** — The frontend sends operands and operation to the API, which performs the calculation. This keeps the backend as the source of truth for math operations.
- **Standard library only (Go)** — No external dependencies. Demonstrates Go proficiency and keeps the dependency tree clean.
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

Performs an arithmetic operation on two numbers.

**Request:**
```json
{
  "operation": "add",
  "a": 10,
  "b": 5
}
```

**Response (200):**
```json
{
  "result": 15,
  "operation": "add"
}
```

**Error (400):**
```json
{
  "error": "division by zero"
}
```

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
| `factorial` | Factorial              | `5! = 120`          |
| `reciprocal`| Reciprocal (1/x)       | `1/4 = 0.25`        |
| `abs`       | Absolute value         | `abs(-5) = 5`       |
| `bitnot`    | Bitwise NOT            | `~0 = -1`           |

**Unary request example:**
```json
{
  "operation": "sqrt",
  "a": 16
}
```

#### Error Cases

- Division by zero → `400` with error message
- Square root of negative number → `400`
- Logarithm of non-positive number → `400`
- Invalid factorial (negative, non-integer, >170) → `400`
- Invalid shift amount (<0 or >63) → `400`
- Missing required fields (`operation`, `a`) → `400`
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
npm test
```

### Test Coverage (Backend)

- **Engine tests** — All basic, scientific, and programmer operations with edge cases (72+ tests)
- **Handler tests** — Binary and unary operations, validation errors, bad JSON, wrong HTTP method (16+ tests)
- **Total: 88 tests passing**

## Future Enhancements

- **Calculation History** — Persist and display recent calculations
- **Keyboard Support** — Number keys, Enter for equals, Escape for clear
- **Hex Digit Input** — A-F buttons in programmer mode for hex input
- **Degree/Radian Toggle** — Switch between degree and radian mode for trig functions
