import Button from './Button';

interface ProgrammerButtonGridProps {
  inputDigit: (digit: string) => void;
  inputDecimal: () => void;
  setOperation: (op: string) => void;
  calculate: () => void;
  clear: () => void;
  toggleSign: () => void;
  percentage: () => void;
  unaryOperation: (operation: string) => void;
  setConstant: (value: number) => void;
  base: number;
  onBaseChange: (base: number) => void;
}

function isDigitEnabled(digit: number, base: number): boolean {
  return digit < base;
}

export default function ProgrammerButtonGrid({
  inputDigit,
  setOperation,
  calculate,
  clear,
  toggleSign,
  unaryOperation,
  base,
  onBaseChange,
}: ProgrammerButtonGridProps) {
  return (
    <div className="grid grid-cols-4 gap-3 p-3 bg-[#1c1c1e]">
      {/* Row 1: Base selector */}
      <Button label="HEX" onClick={() => onBaseChange(16)} variant={base === 16 ? 'base-active' : 'base-inactive'} />
      <Button label="DEC" onClick={() => onBaseChange(10)} variant={base === 10 ? 'base-active' : 'base-inactive'} />
      <Button label="OCT" onClick={() => onBaseChange(8)} variant={base === 8 ? 'base-active' : 'base-inactive'} />
      <Button label="BIN" onClick={() => onBaseChange(2)} variant={base === 2 ? 'base-active' : 'base-inactive'} />

      {/* Row 2: Bitwise operators */}
      <Button label="AND" onClick={() => setOperation('bitand')} variant="programmer" />
      <Button label="OR" onClick={() => setOperation('bitor')} variant="programmer" />
      <Button label="XOR" onClick={() => setOperation('bitxor')} variant="programmer" />
      <Button label="NOT" onClick={() => unaryOperation('bitnot')} variant="programmer" />

      {/* Row 3: Shift and extra */}
      <Button label="<<" onClick={() => setOperation('lshift')} variant="programmer" />
      <Button label=">>" onClick={() => setOperation('rshift')} variant="programmer" />
      <Button label="CLR" onClick={clear} variant="function" />
      <Button label="÷" onClick={() => setOperation('divide')} variant="operator" />

      {/* Row 4: 7 8 9 × */}
      <Button label="7" onClick={() => inputDigit('7')} disabled={!isDigitEnabled(7, base)} />
      <Button label="8" onClick={() => inputDigit('8')} disabled={!isDigitEnabled(8, base)} />
      <Button label="9" onClick={() => inputDigit('9')} disabled={!isDigitEnabled(9, base)} />
      <Button label="×" onClick={() => setOperation('multiply')} variant="operator" />

      {/* Row 5: 4 5 6 − */}
      <Button label="4" onClick={() => inputDigit('4')} disabled={!isDigitEnabled(4, base)} />
      <Button label="5" onClick={() => inputDigit('5')} disabled={!isDigitEnabled(5, base)} />
      <Button label="6" onClick={() => inputDigit('6')} disabled={!isDigitEnabled(6, base)} />
      <Button label="−" onClick={() => setOperation('subtract')} variant="operator" />

      {/* Row 6: 1 2 3 + */}
      <Button label="1" onClick={() => inputDigit('1')} disabled={!isDigitEnabled(1, base)} />
      <Button label="2" onClick={() => inputDigit('2')} disabled={!isDigitEnabled(2, base)} />
      <Button label="3" onClick={() => inputDigit('3')} disabled={!isDigitEnabled(3, base)} />
      <Button label="+" onClick={() => setOperation('add')} variant="operator" />

      {/* Row 7: 0 (wide) ± = */}
      <Button label="0" onClick={() => inputDigit('0')} variant="wide" />
      <Button label="±" onClick={toggleSign} variant="function" />
      <Button label="=" onClick={calculate} variant="equals" />
    </div>
  );
}
