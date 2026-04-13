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
  | { type: 'SET_CONSTANT'; value: string }
  | { type: 'INPUT_PAREN'; paren: '(' | ')' };

export interface ApiRequest {
  operation: string;
  a: number;
  b?: number;
}

export const OPERATION_DISPLAY_SYMBOLS: Record<string, string> = {
  add: '+', subtract: '\u2212', multiply: '\u00d7', divide: '\u00f7',
  power: '^', bitand: '&', bitor: '|', bitxor: 'XOR',
  lshift: '<<', rshift: '>>', mod: '%',
};

export const OPERATION_EVAL_SYMBOLS: Record<string, string> = {
  add: '+', subtract: '-', multiply: '*', divide: '/',
  power: '^', bitand: '&', bitor: '|', bitxor: 'XOR',
  lshift: '<<', rshift: '>>', mod: '%',
};

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
