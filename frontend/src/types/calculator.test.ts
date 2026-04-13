import { describe, it, expect } from 'vitest';
import type { CalculatorMode, CalculatorState, CalculatorAction, ApiRequest, ApiResponse, ApiError } from './calculator';

describe('calculator types', () => {
  it('exports expected types', () => {
    // Type-level check: these should compile without error
    const mode: CalculatorMode = 'basic';
    const state: CalculatorState = {
      display: '0',
      previousValue: null,
      operation: null,
      waitingForOperand: false,
      expression: '',
    };
    const _action: CalculatorAction = { type: 'CLEAR' };
    const _request: ApiRequest = { operation: 'add', a: 1, b: 2 };
    const _response: ApiResponse = { result: 3, operation: 'add' };
    const _error: ApiError = { error: 'oops' };
    expect(mode).toBe('basic');
    expect(state.display).toBe('0');
  });
});
