import Button from './Button';

interface ButtonGridProps {
  inputDigit: (digit: string) => void;
  inputDecimal: () => void;
  setOperation: (op: string) => void;
  calculate: () => void;
  clear: () => void;
  toggleSign: () => void;
  percentage: () => void;
}

export default function ButtonGrid({
  inputDigit,
  inputDecimal,
  setOperation,
  calculate,
  clear,
  toggleSign,
  percentage,
}: ButtonGridProps) {
  return (
    <div className="grid grid-cols-4 gap-3 p-3 bg-[#1c1c1e]">
      {/* Row 1 */}
      <Button label="C" onClick={clear} variant="function" />
      <Button label="+/-" onClick={toggleSign} variant="function" />
      <Button label="%" onClick={percentage} variant="function" />
      <Button label="÷" onClick={() => setOperation('divide')} variant="operator" />

      {/* Row 2 */}
      <Button label="7" onClick={() => inputDigit('7')} />
      <Button label="8" onClick={() => inputDigit('8')} />
      <Button label="9" onClick={() => inputDigit('9')} />
      <Button label="×" onClick={() => setOperation('multiply')} variant="operator" />

      {/* Row 3 */}
      <Button label="4" onClick={() => inputDigit('4')} />
      <Button label="5" onClick={() => inputDigit('5')} />
      <Button label="6" onClick={() => inputDigit('6')} />
      <Button label="−" onClick={() => setOperation('subtract')} variant="operator" />

      {/* Row 4 */}
      <Button label="1" onClick={() => inputDigit('1')} />
      <Button label="2" onClick={() => inputDigit('2')} />
      <Button label="3" onClick={() => inputDigit('3')} />
      <Button label="+" onClick={() => setOperation('add')} variant="operator" />

      {/* Row 5 */}
      <Button label="0" onClick={() => inputDigit('0')} variant="wide" />
      <Button label="." onClick={inputDecimal} />
      <Button label="=" onClick={calculate} variant="equals" />
    </div>
  );
}
