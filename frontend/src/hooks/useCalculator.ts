import { useReducer, useCallback } from 'react';
import type { CalculatorState, CalculatorAction } from '../types/calculator';
import { OPERATION_EVAL_SYMBOLS } from '../types/calculator';
import { calculate as apiCalculate, calculateUnary as apiCalculateUnary, evaluate as apiEvaluate } from '../services/api';

const initialState: CalculatorState = {
  display: '0',
  previousValue: null,
  operation: null,
  waitingForOperand: false,
  expression: '',
  expressionTokens: [],
  openParens: 0,
  resultDisplay: '',
};

function updateTokensForDigit(tokens: string[], digit: string, waitingForOperand: boolean): string[] {
  const updated = [...tokens];
  const last = updated[updated.length - 1];
  if (last !== undefined && /^-?\d*\.?\d*$/.test(last) && !waitingForOperand) {
    updated[updated.length - 1] = last + digit;
  } else {
    updated.push(digit);
  }
  return updated;
}

function updateTokensForDecimal(tokens: string[]): string[] {
  const updated = [...tokens];
  const last = updated[updated.length - 1];
  if (last !== undefined && /^\d+$/.test(last)) {
    updated[updated.length - 1] = last + '.';
  } else {
    updated.push('0.');
  }
  return updated;
}

export function reducer(state: CalculatorState, action: CalculatorAction): CalculatorState {
  switch (action.type) {
    case 'INPUT_DIGIT': {
      if (state.waitingForOperand) {
        return {
          ...state,
          display: action.digit,
          waitingForOperand: false,
          expressionTokens: [...state.expressionTokens, action.digit],
        };
      }
      if (state.display === '0' && action.digit === '0') return state;
      const newDisplay = state.display === '0' ? action.digit : state.display + action.digit;
      if (newDisplay.replace(/[^0-9]/g, '').length > 12) return state;
      return {
        ...state,
        display: newDisplay,
        expressionTokens: updateTokensForDigit(state.expressionTokens, action.digit, false),
      };
    }

    case 'INPUT_DECIMAL': {
      if (state.waitingForOperand) {
        return {
          ...state,
          display: '0.',
          waitingForOperand: false,
          expressionTokens: [...state.expressionTokens, '0.'],
        };
      }
      if (state.display.includes('.')) return state;
      return {
        ...state,
        display: state.display + '.',
        expressionTokens: updateTokensForDecimal(state.expressionTokens),
      };
    }

    case 'SET_OPERATION': {
      const currentValue = parseFloat(state.display);
      const evalSymbol = OPERATION_EVAL_SYMBOLS[action.operation] ?? action.operation;
      const newTokens = [...state.expressionTokens, evalSymbol];

      return {
        ...state,
        previousValue: currentValue,
        operation: action.operation,
        waitingForOperand: true,
        expression: newTokens.join(' ') + ' ',
        expressionTokens: newTokens,
      };
    }

    case 'CALCULATE': {
      const displayValue = action.resultDisplay || String(action.result);
      return {
        ...state,
        display: displayValue,
        resultDisplay: action.resultDisplay || '',
        previousValue: null,
        operation: null,
        waitingForOperand: true,
        expression: '',
        expressionTokens: [],
        openParens: 0,
      };
    }

    case 'CLEAR':
      return initialState;

    case 'TOGGLE_SIGN': {
      if (state.display === '0') return state;
      const toggled = state.display.startsWith('-')
        ? state.display.slice(1)
        : '-' + state.display;
      // Update last expression token to match
      const tokens = [...state.expressionTokens];
      if (tokens.length > 0) {
        const last = tokens[tokens.length - 1];
        if (/^-?\d/.test(last)) {
          tokens[tokens.length - 1] = toggled;
        }
      }
      return { ...state, display: toggled, expressionTokens: tokens };
    }

    case 'PERCENTAGE': {
      const value = parseFloat(state.display) / 100;
      const tokens = [...state.expressionTokens];
      if (tokens.length > 0) {
        const last = tokens[tokens.length - 1];
        if (/^-?\d/.test(last)) {
          tokens[tokens.length - 1] = String(value);
        }
      }
      return { ...state, display: String(value), expressionTokens: tokens };
    }

    case 'SET_ERROR': {
      return {
        ...initialState,
        display: action.message,
        resultDisplay: '',
      };
    }

    case 'SET_CONSTANT': {
      return {
        ...state,
        display: action.value,
        waitingForOperand: false,
        expressionTokens: [],
        openParens: 0,
      };
    }

    case 'INPUT_PAREN': {
      if (action.paren === '(') {
        return {
          ...state,
          expressionTokens: [...state.expressionTokens, '('],
          openParens: state.openParens + 1,
          waitingForOperand: true,
        };
      } else {
        if (state.openParens <= 0) return state;
        return {
          ...state,
          expressionTokens: [...state.expressionTokens, ')'],
          openParens: state.openParens - 1,
        };
      }
    }

    default:
      return state;
  }
}

export function useCalculator() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const inputDigit = useCallback((digit: string) => {
    dispatch({ type: 'INPUT_DIGIT', digit });
  }, []);

  const inputDecimal = useCallback(() => {
    dispatch({ type: 'INPUT_DECIMAL' });
  }, []);

  const setOperation = useCallback((operation: string) => {
    dispatch({ type: 'SET_OPERATION', operation });
  }, []);

  const calculate = useCallback(async () => {
    const hasParens = state.expressionTokens.some(t => t === '(' || t === ')');
    if (hasParens) {
      const expr = state.expressionTokens.join(' ');
      try {
        const { result, resultDisplay } = await apiEvaluate(expr);
        dispatch({ type: 'CALCULATE', result, resultDisplay });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Calculation error';
        dispatch({ type: 'SET_ERROR', message });
      }
      return;
    }
    if (state.previousValue === null || state.operation === null) return;
    const b = parseFloat(state.display);
    try {
      const { result, resultDisplay } = await apiCalculate(state.operation, state.previousValue, b);
      dispatch({ type: 'CALCULATE', result, resultDisplay });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Calculation error';
      dispatch({ type: 'SET_ERROR', message });
    }
  }, [state.expressionTokens, state.previousValue, state.operation, state.display]);

  const clear = useCallback(() => {
    dispatch({ type: 'CLEAR' });
  }, []);

  const toggleSign = useCallback(() => {
    dispatch({ type: 'TOGGLE_SIGN' });
  }, []);

  const percentage = useCallback(() => {
    dispatch({ type: 'PERCENTAGE' });
  }, []);

  const unaryOperation = useCallback(async (operation: string) => {
    const a = parseFloat(state.display);
    try {
      const { result, resultDisplay } = await apiCalculateUnary(operation, a);
      dispatch({ type: 'CALCULATE', result, resultDisplay });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Calculation error';
      dispatch({ type: 'SET_ERROR', message });
    }
  }, [state.display]);

  const setConstant = useCallback((value: number) => {
    dispatch({ type: 'SET_CONSTANT', value: String(value) });
  }, []);

  const loadResult = useCallback((result: number) => {
    dispatch({ type: 'CALCULATE', result });
  }, []);

  const inputParen = useCallback((paren: '(' | ')') => {
    dispatch({ type: 'INPUT_PAREN', paren });
  }, []);

  return {
    state,
    inputDigit,
    inputDecimal,
    setOperation,
    calculate,
    clear,
    toggleSign,
    percentage,
    unaryOperation,
    setConstant,
    loadResult,
    inputParen,
  };
}
