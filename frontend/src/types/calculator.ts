export type CalculatorMode = 'basic' | 'scientific' | 'programmer';

export interface CalculatorState {
  display: string;
  previousValue: number | null;
  operation: string | null;
  waitingForOperand: boolean;
  expression: string;
}

export type CalculatorAction =
  | { type: 'INPUT_DIGIT'; digit: string }
  | { type: 'INPUT_DECIMAL' }
  | { type: 'SET_OPERATION'; operation: string }
  | { type: 'CALCULATE'; result: number }
  | { type: 'CLEAR' }
  | { type: 'TOGGLE_SIGN' }
  | { type: 'PERCENTAGE' }
  | { type: 'SET_ERROR'; message: string }
  | { type: 'UNARY_OPERATION'; operation: string }
  | { type: 'SET_CONSTANT'; value: string };

export interface ApiRequest {
  operation: string;
  a: number;
  b: number;
}

export interface ApiResponse {
  result: number;
  operation: string;
}

export interface ApiError {
  error: string;
}
