import { useEffect, useRef } from 'react';
import type { HistoryEntry } from '../types/calculator';
import { formatEntry } from './History';

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

interface DisplayProps {
  expression: string;
  value: string;
  base?: number;
  history?: HistoryEntry[];
  onHistorySelect?: (result: number) => void;
  onClearHistory?: () => void;
}

export default function Display({ expression, value, base = 10, history = [], onHistorySelect, onClearHistory }: DisplayProps) {
  const displayValue = formatValueForBase(value, base);
  const isLong = displayValue.length > 9;
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  return (
    <div className="bg-[#1c1c1e] px-4 pt-1 pb-2 flex flex-col min-h-[140px]">
      {history.length > 0 && (
        <button
          onClick={onClearHistory}
          className="text-[10px] text-red-400 hover:text-red-300 transition-colors cursor-pointer self-start mb-0.5"
        >
          Clear History
        </button>
      )}
      <div ref={scrollRef} className="flex-1 overflow-y-auto max-h-[72px] scrollbar-thin">
        {history.length > 0 ? (
          <ul className="space-y-0.5">
            {[...history].reverse().map((entry) => (
              <li
                key={entry.id}
                onClick={() => onHistorySelect?.(entry.result)}
                className="text-[#636366] text-xs font-mono text-right cursor-pointer hover:text-[#a1a1a6] transition-colors truncate"
              >
                {formatEntry(entry)}
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-[#a1a1a6] text-sm font-mono text-right h-6 truncate">
            {expression}
          </div>
        )}
      </div>
      <div
        className={`text-white font-mono text-right break-all transition-all duration-150 mt-auto ${
          isLong ? 'text-2xl' : 'text-4xl'
        }`}
      >
        {displayValue}
      </div>
    </div>
  );
}
