export type CalculatorMode = 'basic' | 'scientific' | 'programmer';

export interface CalculatorState {
  display: string;
  previousValue: number | null;
  operation: string | null;
  waitingForOperand: boolean;
  expression: string;
  expressionTokens: string[];
  openParens: number;
  resultDisplay: string;
}

export type CalculatorAction =
  | { type: 'INPUT_DIGIT'; digit: string }
  | { type: 'INPUT_DECIMAL' }
  | { type: 'SET_OPERATION'; operation: string }
  | { type: 'CALCULATE'; result: number; resultDisplay?: string }
  | { type: 'CLEAR' }
  | { type: 'TOGGLE_SIGN' }
  | { type: 'PERCENTAGE' }
  | { type: 'SET_ERROR'; message: string }
  | { type: 'UNARY_OPERATION'; operation: string }
  | { type: 'SET_CONSTANT'; value: string }
  | { type: 'INPUT_PAREN'; paren: '(' | ')' };

export interface ApiRequest {
  operation: string;
  a: number;
  b: number;
}

export interface ApiResponse {
  result: number;
  resultDisplay?: string;
  operation: string;
}

export interface ApiError {
  error: string;
}

export interface HistoryEntry {
  id: number;
  operation: string;
  a?: number;
  b?: number;
  result: number;
  resultDisplay?: string;
  timestamp: string;
  expression?: string;
}
