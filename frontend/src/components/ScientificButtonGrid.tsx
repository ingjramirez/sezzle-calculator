import Button from './Button';

interface ScientificButtonGridProps {
  inputDigit: (digit: string) => void;
  inputDecimal: () => void;
  setOperation: (op: string) => void;
  calculate: () => void;
  clear: () => void;
  toggleSign: () => void;
  percentage: () => void;
  unaryOperation: (operation: string) => void;
  setConstant: (value: number) => void;
}

export default function ScientificButtonGrid({
  inputDigit,
  inputDecimal,
  setOperation,
  calculate,
  clear,
  toggleSign,
  percentage,
  unaryOperation,
  setConstant,
}: ScientificButtonGridProps) {
  return (
    <div className="grid grid-cols-4 gap-3 p-3 bg-[#1c1c1e]">
      {/* Scientific Row 1 */}
      <Button label="sin" onClick={() => unaryOperation('sin')} variant="scientific" />
      <Button label="cos" onClick={() => unaryOperation('cos')} variant="scientific" />
      <Button label="tan" onClick={() => unaryOperation('tan')} variant="scientific" />
      <Button label="π" onClick={() => setConstant(Math.PI)} variant="scientific" />

      {/* Scientific Row 2 */}
      <Button label="ln" onClick={() => unaryOperation('ln')} variant="scientific" />
      <Button label="log" onClick={() => unaryOperation('log10')} variant="scientific" />
      <Button label="√x" onClick={() => unaryOperation('sqrt')} variant="scientific" />
      <Button label="xʸ" onClick={() => setOperation('power')} variant="operator" />

      {/* Scientific Row 3 */}
      <Button label="x²" onClick={() => unaryOperation('square')} variant="scientific" />
      <Button label="n!" onClick={() => unaryOperation('factorial')} variant="scientific" />
      <Button label="1/x" onClick={() => unaryOperation('reciprocal')} variant="scientific" />
      <Button label="e" onClick={() => setConstant(Math.E)} variant="scientific" />

      {/* Row 4: Function / Operator */}
      <Button label="C" onClick={clear} variant="function" />
      <Button label="+/-" onClick={toggleSign} variant="function" />
      <Button label="%" onClick={percentage} variant="function" />
      <Button label="÷" onClick={() => setOperation('divide')} variant="operator" />

      {/* Row 5 */}
      <Button label="7" onClick={() => inputDigit('7')} />
      <Button label="8" onClick={() => inputDigit('8')} />
      <Button label="9" onClick={() => inputDigit('9')} />
      <Button label="×" onClick={() => setOperation('multiply')} variant="operator" />

      {/* Row 6 */}
      <Button label="4" onClick={() => inputDigit('4')} />
      <Button label="5" onClick={() => inputDigit('5')} />
      <Button label="6" onClick={() => inputDigit('6')} />
      <Button label="−" onClick={() => setOperation('subtract')} variant="operator" />

      {/* Row 7 */}
      <Button label="1" onClick={() => inputDigit('1')} />
      <Button label="2" onClick={() => inputDigit('2')} />
      <Button label="3" onClick={() => inputDigit('3')} />
      <Button label="+" onClick={() => setOperation('add')} variant="operator" />

      {/* Row 8 */}
      <Button label="0" onClick={() => inputDigit('0')} variant="wide" />
      <Button label="." onClick={inputDecimal} />
      <Button label="=" onClick={calculate} variant="equals" />
    </div>
  );
}
