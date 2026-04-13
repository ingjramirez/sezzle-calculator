interface DisplayProps {
  expression: string;
  value: string;
  base?: number;
}

function formatValueForBase(value: string, base: number): string {
  if (base === 10) return value;

  const num = parseFloat(value);
  if (isNaN(num)) return value;

  const truncated = Math.trunc(num);

  switch (base) {
    case 16:
      return '0x' + truncated.toString(16).toUpperCase();
    case 8:
      return '0o' + truncated.toString(8);
    case 2:
      return '0b' + truncated.toString(2);
    default:
      return value;
  }
}

export default function Display({ expression, value, base = 10 }: DisplayProps) {
  const displayValue = formatValueForBase(value, base);
  const isLong = displayValue.length > 9;

  return (
    <div className="bg-[#1c1c1e] rounded-t-2xl px-6 pt-4 pb-2 min-h-[120px] flex flex-col justify-end">
      <div className="text-[#a1a1a6] text-sm font-mono text-right h-6 truncate">
        {expression}
      </div>
      <div
        className={`text-white font-mono text-right break-all transition-all duration-150 ${
          isLong ? 'text-2xl' : 'text-4xl'
        }`}
      >
        {displayValue}
      </div>
    </div>
  );
}
