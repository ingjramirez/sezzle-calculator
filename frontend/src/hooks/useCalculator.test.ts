import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCalculator, reducer } from './useCalculator';
import type { CalculatorState } from '../types/calculator';

vi.mock('../services/api', () => ({
  calculate: vi.fn(),
  calculateUnary: vi.fn(),
  evaluate: vi.fn(),
}));

import { calculate as apiCalculate, calculateUnary as apiCalculateUnary, evaluate as apiEvaluate } from '../services/api';

const mockedApiCalculate = vi.mocked(apiCalculate);
const mockedApiCalculateUnary = vi.mocked(apiCalculateUnary);
const mockedApiEvaluate = vi.mocked(apiEvaluate);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useCalculator', () => {
  it('has correct initial state', () => {
    const { result } = renderHook(() => useCalculator());
    expect(result.current.state).toEqual({
      display: '0',
      previousValue: null,
      operation: null,
      waitingForOperand: false,
      expression: '',
      expressionTokens: [],
      openParens: 0,
    });
  });

  describe('inputDigit', () => {
    it('appends digits to display', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('1'));
      expect(result.current.state.display).toBe('1');
      act(() => result.current.inputDigit('2'));
      expect(result.current.state.display).toBe('12');
    });

    it('replaces "0" with new digit', () => {
      const { result } = renderHook(() => useCalculator());
      expect(result.current.state.display).toBe('0');
      act(() => result.current.inputDigit('5'));
      expect(result.current.state.display).toBe('5');
    });

    it('does not add leading zero when display is "0"', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('0'));
      expect(result.current.state.display).toBe('0');
    });

    it('limits digits to 12', () => {
      const { result } = renderHook(() => useCalculator());
      for (let i = 0; i < 12; i++) {
        act(() => result.current.inputDigit('1'));
      }
      expect(result.current.state.display).toBe('111111111111');
      act(() => result.current.inputDigit('1'));
      expect(result.current.state.display).toBe('111111111111');
    });

    it('replaces display when waitingForOperand', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('5'));
      act(() => result.current.setOperation('add'));
      expect(result.current.state.waitingForOperand).toBe(true);
      act(() => result.current.inputDigit('3'));
      expect(result.current.state.display).toBe('3');
    });

    it('tracks expression tokens when building numbers', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('1'));
      act(() => result.current.inputDigit('2'));
      expect(result.current.state.expressionTokens).toEqual(['12']);
    });

    it('adds new token when waitingForOperand', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('5'));
      act(() => result.current.setOperation('add'));
      act(() => result.current.inputDigit('3'));
      expect(result.current.state.expressionTokens).toEqual(['5', '+', '3']);
    });
  });

  describe('inputDecimal', () => {
    it('adds "." to display', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDecimal());
      expect(result.current.state.display).toBe('0.');
    });

    it('prevents double decimal', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDecimal());
      act(() => result.current.inputDecimal());
      expect(result.current.state.display).toBe('0.');
    });

    it('starts with "0." when waitingForOperand', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('5'));
      act(() => result.current.setOperation('add'));
      act(() => result.current.inputDecimal());
      expect(result.current.state.display).toBe('0.');
    });

    it('tracks decimal in expression tokens', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('3'));
      act(() => result.current.inputDecimal());
      expect(result.current.state.expressionTokens).toEqual(['3.']);
    });

    it('adds 0. token when waitingForOperand', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('5'));
      act(() => result.current.setOperation('add'));
      act(() => result.current.inputDecimal());
      expect(result.current.state.expressionTokens).toEqual(['5', '+', '0.']);
    });
  });

  describe('setOperation', () => {
    it('stores previousValue and sets operation', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('8'));
      act(() => result.current.setOperation('add'));
      expect(result.current.state.previousValue).toBe(8);
      expect(result.current.state.operation).toBe('add');
      expect(result.current.state.waitingForOperand).toBe(true);
      expect(result.current.state.expression).toBe('8 + ');
    });

    it('shows correct symbol for subtract', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('5'));
      act(() => result.current.setOperation('subtract'));
      expect(result.current.state.expression).toBe('5 - ');
    });

    it('shows correct symbol for multiply', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('5'));
      act(() => result.current.setOperation('multiply'));
      expect(result.current.state.expression).toBe('5 * ');
    });

    it('shows correct symbol for divide', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('5'));
      act(() => result.current.setOperation('divide'));
      expect(result.current.state.expression).toBe('5 / ');
    });

    it('shows correct symbol for power', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('2'));
      act(() => result.current.setOperation('power'));
      expect(result.current.state.expression).toBe('2 ^ ');
    });

    it('shows correct symbol for bitand', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('5'));
      act(() => result.current.setOperation('bitand'));
      expect(result.current.state.expression).toBe('5 & ');
    });

    it('shows correct symbol for bitor', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('5'));
      act(() => result.current.setOperation('bitor'));
      expect(result.current.state.expression).toBe('5 | ');
    });

    it('shows correct symbol for bitxor', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('5'));
      act(() => result.current.setOperation('bitxor'));
      expect(result.current.state.expression).toBe('5 XOR ');
    });

    it('shows correct symbol for lshift', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('5'));
      act(() => result.current.setOperation('lshift'));
      expect(result.current.state.expression).toBe('5 << ');
    });

    it('shows correct symbol for rshift', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('5'));
      act(() => result.current.setOperation('rshift'));
      expect(result.current.state.expression).toBe('5 >> ');
    });

    it('shows correct symbol for mod', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('5'));
      act(() => result.current.setOperation('mod'));
      expect(result.current.state.expression).toBe('5 % ');
    });

    it('uses operation name as fallback symbol for unknown operations', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('5'));
      act(() => result.current.setOperation('unknown_op'));
      expect(result.current.state.expression).toBe('5 unknown_op ');
    });

    it('tracks operator in expression tokens', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('5'));
      act(() => result.current.setOperation('add'));
      expect(result.current.state.expressionTokens).toEqual(['5', '+']);
    });
  });

  describe('calculate', () => {
    it('calls API and updates display with result', async () => {
      mockedApiCalculate.mockResolvedValue(13);
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('5'));
      act(() => result.current.setOperation('add'));
      act(() => result.current.inputDigit('8'));
      await act(async () => {
        await result.current.calculate();
      });
      expect(mockedApiCalculate).toHaveBeenCalledWith('add', 5, 8);
      expect(result.current.state.display).toBe('13');
      expect(result.current.state.previousValue).toBeNull();
      expect(result.current.state.operation).toBeNull();
      expect(result.current.state.expression).toBe('');
    });

    it('does nothing when no previousValue or operation', async () => {
      const { result } = renderHook(() => useCalculator());
      await act(async () => {
        await result.current.calculate();
      });
      expect(mockedApiCalculate).not.toHaveBeenCalled();
      expect(result.current.state.display).toBe('0');
    });

    it('handles API errors with Error instance', async () => {
      mockedApiCalculate.mockRejectedValue(new Error('division by zero'));
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('1'));
      act(() => result.current.setOperation('divide'));
      act(() => result.current.inputDigit('0'));
      await act(async () => {
        await result.current.calculate();
      });
      expect(result.current.state.display).toBe('division by zero');
    });

    it('handles API errors with non-Error thrown value', async () => {
      mockedApiCalculate.mockRejectedValue('some string error');
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('1'));
      act(() => result.current.setOperation('add'));
      act(() => result.current.inputDigit('2'));
      await act(async () => {
        await result.current.calculate();
      });
      expect(result.current.state.display).toBe('Calculation error');
    });

    it('uses evaluate API when expression contains parentheses', async () => {
      mockedApiEvaluate.mockResolvedValue(14);
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputParen('('));
      act(() => result.current.inputDigit('2'));
      act(() => result.current.setOperation('add'));
      act(() => result.current.inputDigit('5'));
      act(() => result.current.inputParen(')'));
      act(() => result.current.setOperation('multiply'));
      act(() => result.current.inputDigit('2'));
      await act(async () => {
        await result.current.calculate();
      });
      expect(mockedApiEvaluate).toHaveBeenCalledWith('( 2 + 5 ) * 2');
      expect(result.current.state.display).toBe('14');
    });

    it('handles evaluate API errors with Error instance', async () => {
      mockedApiEvaluate.mockRejectedValue(new Error('invalid expression'));
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputParen('('));
      act(() => result.current.inputDigit('1'));
      await act(async () => {
        await result.current.calculate();
      });
      expect(result.current.state.display).toBe('invalid expression');
    });

    it('handles evaluate API errors with non-Error thrown value', async () => {
      mockedApiEvaluate.mockRejectedValue(42);
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputParen('('));
      act(() => result.current.inputDigit('1'));
      await act(async () => {
        await result.current.calculate();
      });
      expect(result.current.state.display).toBe('Calculation error');
    });

    it('resets expression tokens after successful calculation', async () => {
      mockedApiCalculate.mockResolvedValue(10);
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('5'));
      act(() => result.current.setOperation('add'));
      act(() => result.current.inputDigit('5'));
      await act(async () => {
        await result.current.calculate();
      });
      expect(result.current.state.expressionTokens).toEqual([]);
      expect(result.current.state.openParens).toBe(0);
    });
  });

  describe('clear', () => {
    it('resets to initial state', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('5'));
      act(() => result.current.setOperation('add'));
      act(() => result.current.clear());
      expect(result.current.state).toEqual({
        display: '0',
        previousValue: null,
        operation: null,
        waitingForOperand: false,
        expression: '',
        expressionTokens: [],
        openParens: 0,
      });
    });

    it('resets expression tokens and openParens', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputParen('('));
      act(() => result.current.inputDigit('5'));
      act(() => result.current.clear());
      expect(result.current.state.expressionTokens).toEqual([]);
      expect(result.current.state.openParens).toBe(0);
    });
  });

  describe('toggleSign', () => {
    it('negates positive display', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('5'));
      act(() => result.current.toggleSign());
      expect(result.current.state.display).toBe('-5');
    });

    it('makes negative display positive', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('5'));
      act(() => result.current.toggleSign());
      act(() => result.current.toggleSign());
      expect(result.current.state.display).toBe('5');
    });

    it('does nothing when display is "0"', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.toggleSign());
      expect(result.current.state.display).toBe('0');
    });

    it('resets expression tokens', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('5'));
      act(() => result.current.toggleSign());
      expect(result.current.state.expressionTokens).toEqual([]);
      expect(result.current.state.openParens).toBe(0);
    });
  });

  describe('percentage', () => {
    it('divides display by 100', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('5'));
      act(() => result.current.inputDigit('0'));
      act(() => result.current.percentage());
      expect(result.current.state.display).toBe('0.5');
    });

    it('resets expression tokens', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('5'));
      act(() => result.current.percentage());
      expect(result.current.state.expressionTokens).toEqual([]);
      expect(result.current.state.openParens).toBe(0);
    });
  });

  describe('unaryOperation', () => {
    it('calls calculateUnary API and dispatches result', async () => {
      mockedApiCalculateUnary.mockResolvedValue(3);
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('9'));
      await act(async () => {
        await result.current.unaryOperation('sqrt');
      });
      expect(mockedApiCalculateUnary).toHaveBeenCalledWith('sqrt', 9);
      expect(result.current.state.display).toBe('3');
    });

    it('handles API errors with Error instance', async () => {
      mockedApiCalculateUnary.mockRejectedValue(new Error('invalid input'));
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('1'));
      await act(async () => {
        await result.current.unaryOperation('sqrt');
      });
      expect(result.current.state.display).toBe('invalid input');
    });

    it('handles API errors with non-Error thrown value', async () => {
      mockedApiCalculateUnary.mockRejectedValue(42);
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('1'));
      await act(async () => {
        await result.current.unaryOperation('sqrt');
      });
      expect(result.current.state.display).toBe('Calculation error');
    });
  });

  describe('setConstant', () => {
    it('sets display to constant value', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.setConstant(Math.PI));
      expect(result.current.state.display).toBe(String(Math.PI));
      expect(result.current.state.waitingForOperand).toBe(false);
    });

    it('resets expression tokens', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('5'));
      act(() => result.current.setConstant(Math.PI));
      expect(result.current.state.expressionTokens).toEqual([]);
      expect(result.current.state.openParens).toBe(0);
    });
  });

  describe('loadResult', () => {
    it('sets display to the given result and clears state', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('5'));
      act(() => result.current.setOperation('add'));
      act(() => result.current.loadResult(42));
      expect(result.current.state.display).toBe('42');
      expect(result.current.state.previousValue).toBeNull();
      expect(result.current.state.operation).toBeNull();
      expect(result.current.state.waitingForOperand).toBe(true);
      expect(result.current.state.expression).toBe('');
    });
  });

  describe('inputParen', () => {
    it('inputParen("(") adds to expressionTokens and increments openParens', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputParen('('));
      expect(result.current.state.expressionTokens).toEqual(['(']);
      expect(result.current.state.openParens).toBe(1);
      expect(result.current.state.waitingForOperand).toBe(true);
    });

    it('inputParen(")") decrements openParens', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputParen('('));
      act(() => result.current.inputDigit('5'));
      act(() => result.current.inputParen(')'));
      expect(result.current.state.expressionTokens).toEqual(['(', '5', ')']);
      expect(result.current.state.openParens).toBe(0);
    });

    it('inputParen(")") is no-op when openParens is 0', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputParen(')'));
      expect(result.current.state.expressionTokens).toEqual([]);
      expect(result.current.state.openParens).toBe(0);
    });

    it('supports nested parentheses', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputParen('('));
      act(() => result.current.inputParen('('));
      expect(result.current.state.openParens).toBe(2);
      act(() => result.current.inputDigit('3'));
      act(() => result.current.inputParen(')'));
      expect(result.current.state.openParens).toBe(1);
      act(() => result.current.inputParen(')'));
      expect(result.current.state.openParens).toBe(0);
      expect(result.current.state.expressionTokens).toEqual(['(', '(', '3', ')', ')']);
    });
  });
});

describe('reducer (direct)', () => {
  const initialState: CalculatorState = {
    display: '0',
    previousValue: null,
    operation: null,
    waitingForOperand: false,
    expression: '',
    expressionTokens: [],
    openParens: 0,
  };

  it('UNARY_OPERATION action returns state unchanged (no-op)', () => {
    const result = reducer(initialState, { type: 'UNARY_OPERATION', operation: 'sqrt' });
    expect(result).toBe(initialState);
  });

  it('unknown action type returns state unchanged (default case)', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = reducer(initialState, { type: 'UNKNOWN_ACTION' } as any);
    expect(result).toBe(initialState);
  });

  it('INPUT_DECIMAL adds 0. token when no prior tokens exist', () => {
    const result = reducer(initialState, { type: 'INPUT_DECIMAL' });
    expect(result.expressionTokens).toEqual(['0.']);
    expect(result.display).toBe('0.');
  });

  it('SET_ERROR resets to initial state with error message display', () => {
    const stateWithTokens: CalculatorState = {
      ...initialState,
      expressionTokens: ['(', '5', '+', '3'],
      openParens: 1,
    };
    const result = reducer(stateWithTokens, { type: 'SET_ERROR', message: 'Error' });
    expect(result.display).toBe('Error');
    expect(result.expressionTokens).toEqual([]);
    expect(result.openParens).toBe(0);
  });
});
