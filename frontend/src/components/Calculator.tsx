import { useState, useCallback } from 'react';
import type { CalculatorMode } from '../types/calculator';
import { useCalculator } from '../hooks/useCalculator';
import ModeSelector from './ModeSelector';
import Display from './Display';
import ButtonGrid from './ButtonGrid';
import ScientificButtonGrid from './ScientificButtonGrid';
import ProgrammerButtonGrid from './ProgrammerButtonGrid';

export default function Calculator() {
  const [mode, setMode] = useState<CalculatorMode>('basic');
  const [base, setBase] = useState(10);
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
  } = useCalculator();

  const handleModeChange = useCallback((newMode: CalculatorMode) => {
    setMode(newMode);
    if (newMode !== 'programmer') {
      setBase(10);
    }
  }, []);

  const renderButtonGrid = () => {
    switch (mode) {
      case 'scientific':
        return (
          <ScientificButtonGrid
            inputDigit={inputDigit}
            inputDecimal={inputDecimal}
            setOperation={setOperation}
            calculate={calculate}
            clear={clear}
            toggleSign={toggleSign}
            percentage={percentage}
            unaryOperation={unaryOperation}
            setConstant={setConstant}
          />
        );
      case 'programmer':
        return (
          <ProgrammerButtonGrid
            inputDigit={inputDigit}
            inputDecimal={inputDecimal}
            setOperation={setOperation}
            calculate={calculate}
            clear={clear}
            toggleSign={toggleSign}
            percentage={percentage}
            unaryOperation={unaryOperation}
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
            calculate={calculate}
            clear={clear}
            toggleSign={toggleSign}
            percentage={percentage}
          />
        );
    }
  };

  return (
    <div className="w-80 rounded-2xl shadow-2xl overflow-hidden">
      <ModeSelector activeMode={mode} onModeChange={handleModeChange} />
      <Display
        expression={state.expression}
        value={state.display}
        base={mode === 'programmer' ? base : undefined}
      />
      {renderButtonGrid()}
    </div>
  );
}
