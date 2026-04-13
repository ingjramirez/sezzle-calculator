import type { HistoryEntry } from '../types/calculator';
import { OPERATION_DISPLAY_SYMBOLS } from '../types/calculator';

export function formatEntry(entry: HistoryEntry): string {
  const { operation, a, b, result, expression, resultDisplay } = entry;
  const displayResult = resultDisplay || String(result);

  // Expression-based entries (from /api/evaluate)
  if (expression) {
    return `${expression} = ${displayResult}`;
  }

  if (b !== undefined) {
    const symbol = OPERATION_DISPLAY_SYMBOLS[operation] ?? operation;
    return `${a} ${symbol} ${b} = ${displayResult}`;
  }

  switch (operation) {
    case 'sqrt':
      return `\u221a${a} = ${displayResult}`;
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
      return `${a}\u00b2 = ${displayResult}`;
    case 'cube':
      return `${a}\u00b3 = ${displayResult}`;
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

export function formatTimestamp(timestamp: string): string {
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
