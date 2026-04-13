import { useState, useCallback, useEffect } from 'react';
import type { CalculatorMode, HistoryEntry } from '../types/calculator';
import { useCalculator } from '../hooks/useCalculator';
import { getHistory, clearHistory as apiClearHistory } from '../services/api';
import ModeSelector from './ModeSelector';
import Display from './Display';
import ButtonGrid from './ButtonGrid';
import ScientificButtonGrid from './ScientificButtonGrid';
import ProgrammerButtonGrid from './ProgrammerButtonGrid';

export default function Calculator() {
  const [mode, setMode] = useState<CalculatorMode>('basic');
  const [base, setBase] = useState(10);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const {
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
  } = useCalculator();

  const fetchHistory = useCallback(async () => {
    try {
      const entries = await getHistory();
      setHistory(entries);
    } catch {
      // silently ignore history fetch errors
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleCalculate = useCallback(async () => {
    await calculate();
    await fetchHistory();
  }, [calculate, fetchHistory]);

  const handleUnaryOperation = useCallback(async (operation: string) => {
    await unaryOperation(operation);
    await fetchHistory();
  }, [unaryOperation, fetchHistory]);

  const handleClearHistory = useCallback(async () => {
    try {
      await apiClearHistory();
      setHistory([]);
    } catch {
      // silently ignore clear errors
    }
  }, []);

  const handleModeChange = useCallback((newMode: CalculatorMode) => {
    setMode(newMode);
    if (newMode !== 'programmer') {
      setBase(10);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        inputDigit(e.key);
      } else if (e.key === '.') {
        inputDecimal();
      } else if (e.key === '+') {
        setOperation('add');
      } else if (e.key === '-') {
        setOperation('subtract');
      } else if (e.key === '*') {
        setOperation('multiply');
      } else if (e.key === '/') {
        e.preventDefault();
        setOperation('divide');
      } else if (e.key === '(') {
        inputParen('(');
      } else if (e.key === ')') {
        inputParen(')');
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleCalculate();
      } else if (e.key === 'Escape') {
        clear();
      } else if (e.key === 'Backspace') {
        clear();
      } else if (e.key === '^') {
        setOperation('power');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputDigit, inputDecimal, setOperation, inputParen, handleCalculate, clear]);

  const widthClass = mode === 'scientific' ? 'w-[480px]' : mode === 'programmer' ? 'w-[420px]' : 'w-80';

  const renderButtonGrid = () => {
    switch (mode) {
      case 'scientific':
        return (
          <ScientificButtonGrid
            inputDigit={inputDigit}
            inputDecimal={inputDecimal}
            setOperation={setOperation}
            calculate={handleCalculate}
            clear={clear}
            inputParen={inputParen}
            unaryOperation={handleUnaryOperation}
            setConstant={setConstant}
          />
        );
      case 'programmer':
        return (
          <ProgrammerButtonGrid
            inputDigit={inputDigit}
            inputDecimal={inputDecimal}
            setOperation={setOperation}
            calculate={handleCalculate}
            clear={clear}
            inputParen={inputParen}
            toggleSign={toggleSign}
            unaryOperation={handleUnaryOperation}
            setConstant={setConstant}
            base={base}
            onBaseChange={setBase}
          />
        );
      default:
        return (
          <ButtonGrid
            inputDigit={inputDigit}
            inputDecimal={inputDecimal}
            setOperation={setOperation}
            calculate={handleCalculate}
            clear={clear}
            inputParen={inputParen}
          />
        );
    }
  };

  return (
    <div className={`${widthClass} rounded-2xl shadow-2xl overflow-hidden transition-all duration-300`}>
      <ModeSelector activeMode={mode} onModeChange={handleModeChange} />
      <Display
        expression={state.expression}
        value={state.display}
        base={mode === 'programmer' ? base : undefined}
        history={history}
        onHistorySelect={loadResult}
        onClearHistory={handleClearHistory}
      />
      {renderButtonGrid()}
    </div>
  );
}
