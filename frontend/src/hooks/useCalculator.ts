import { useReducer, useCallback } from 'react';
import type { CalculatorState, CalculatorAction } from '../types/calculator';
import { calculate as apiCalculate, calculateUnary as apiCalculateUnary } from '../services/api';

const initialState: CalculatorState = {
  display: '0',
  previousValue: null,
  operation: null,
  waitingForOperand: false,
  expression: '',
};

export function reducer(state: CalculatorState, action: CalculatorAction): CalculatorState {
  switch (action.type) {
    case 'INPUT_DIGIT': {
      if (state.waitingForOperand) {
        return {
          ...state,
          display: action.digit,
          waitingForOperand: false,
        };
      }
      if (state.display === '0' && action.digit === '0') return state;
      const newDisplay = state.display === '0' ? action.digit : state.display + action.digit;
      if (newDisplay.replace(/[^0-9]/g, '').length > 12) return state;
      return { ...state, display: newDisplay };
    }

    case 'INPUT_DECIMAL': {
      if (state.waitingForOperand) {
        return { ...state, display: '0.', waitingForOperand: false };
      }
      if (state.display.includes('.')) return state;
      return { ...state, display: state.display + '.' };
    }

    case 'SET_OPERATION': {
      const currentValue = parseFloat(state.display);
      const symbolMap: Record<string, string> = {
        add: '+',
        subtract: '-',
        multiply: 'x',
        divide: '/',
        power: '^',
        bitand: '&',
        bitor: '|',
        bitxor: 'XOR',
        lshift: '<<',
        rshift: '>>',
        mod: '%',
      };
      const operationSymbol = symbolMap[action.operation] ?? action.operation;

      return {
        ...state,
        previousValue: currentValue,
        operation: action.operation,
        waitingForOperand: true,
        expression: `${currentValue} ${operationSymbol} `,
      };
    }

    case 'CALCULATE': {
      return {
        ...state,
        display: String(action.result),
        previousValue: null,
        operation: null,
        waitingForOperand: true,
        expression: '',
      };
    }

    case 'CLEAR':
      return initialState;

    case 'TOGGLE_SIGN': {
      if (state.display === '0') return state;
      const toggled = state.display.startsWith('-')
        ? state.display.slice(1)
        : '-' + state.display;
      return { ...state, display: toggled };
    }

    case 'PERCENTAGE': {
      const value = parseFloat(state.display) / 100;
      return { ...state, display: String(value) };
    }

    case 'SET_ERROR': {
      return {
        ...initialState,
        display: action.message,
      };
    }

    case 'UNARY_OPERATION': {
      // Handled async outside reducer; reducer is a no-op for this action
      return state;
    }

    case 'SET_CONSTANT': {
      return {
        ...state,
        display: action.value,
        waitingForOperand: false,
      };
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
    if (state.previousValue === null || state.operation === null) return;
    const b = parseFloat(state.display);
    try {
      const result = await apiCalculate(state.operation, state.previousValue, b);
      dispatch({ type: 'CALCULATE', result });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Calculation error';
      dispatch({ type: 'SET_ERROR', message });
    }
  }, [state.previousValue, state.operation, state.display]);

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
      const result = await apiCalculateUnary(operation, a);
      dispatch({ type: 'CALCULATE', result });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Calculation error';
      dispatch({ type: 'SET_ERROR', message });
    }
  }, [state.display]);

  const setConstant = useCallback((value: number) => {
    dispatch({ type: 'SET_CONSTANT', value: String(value) });
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
  };
}
