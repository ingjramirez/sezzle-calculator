import type { HistoryEntry } from '../types/calculator';

const binarySymbols: Record<string, string> = {
  add: '+',
  subtract: '−',
  multiply: '×',
  divide: '÷',
  power: '^',
  bitand: '&',
  bitor: '|',
  bitxor: 'XOR',
  lshift: '<<',
  rshift: '>>',
  mod: '%',
};

function formatEntry(entry: HistoryEntry): string {
  const { operation, a, b, result, expression, resultDisplay } = entry;
  const displayResult = resultDisplay || String(result);

  // Expression-based entries (from /api/evaluate)
  if (expression) {
    return `${expression} = ${displayResult}`;
  }

  if (b !== undefined) {
    const symbol = binarySymbols[operation] ?? operation;
    return `${a} ${symbol} ${b} = ${displayResult}`;
  }

  switch (operation) {
    case 'sqrt':
      return `√${a} = ${displayResult}`;
    case 'sin':
      return `sin(${a}) = ${displayResult}`;
    case 'cos':
      return `cos(${a}) = ${displayResult}`;
    case 'tan':
      return `tan(${a}) = ${displayResult}`;
    case 'ln':
      return `ln(${a}) = ${displayResult}`;
    case 'log10':
      return `log(${a}) = ${displayResult}`;
    case 'factorial':
      return `${a}! = ${displayResult}`;
    case 'square':
      return `${a}² = ${displayResult}`;
    case 'cube':
      return `${a}³ = ${displayResult}`;
    case 'reciprocal':
      return `1/${a} = ${displayResult}`;
    case 'abs':
      return `|${a}| = ${displayResult}`;
    case 'bitnot':
      return `~${a} = ${displayResult}`;
    default:
      return `${operation}(${a}) = ${displayResult}`;
  }
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;

  return date.toLocaleDateString();
}

interface HistoryProps {
  entries: HistoryEntry[];
  onSelect: (result: number) => void;
  onClear: () => void;
}

export default function History({ entries, onSelect, onClear }: HistoryProps) {
  return (
    <div className="bg-[#1c1c1e] rounded-2xl mt-3 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2">
        <h2 className="text-sm font-semibold text-[#a1a1a6]">History</h2>
        {entries.length > 0 && (
          <button
            onClick={onClear}
            className="text-xs text-red-400 hover:text-red-300 transition-colors cursor-pointer"
          >
            Clear History
          </button>
        )}
      </div>
      <div className="max-h-60 overflow-y-auto">
        {entries.length === 0 ? (
          <p className="text-[#a1a1a6] text-sm text-center py-6">
            No calculations yet
          </p>
        ) : (
          <ul>
            {entries.map((entry) => (
              <li
                key={entry.id}
                onClick={() => onSelect(entry.result)}
                className="px-4 py-2 cursor-pointer hover:bg-[#3a3a3c] transition-colors border-t border-[#2c2c2e]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[#a1a1a6] text-sm">
                    {formatEntry(entry)}
                  </span>
                  <span className="text-[#636366] text-xs ml-2 shrink-0">
                    {formatTimestamp(entry.timestamp)}
                  </span>
                </div>
                <div className="text-white text-base font-medium">
                  {entry.resultDisplay || entry.result}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export { formatEntry, formatTimestamp };
