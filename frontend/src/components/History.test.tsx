import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import History, { formatEntry, formatTimestamp } from './History';
import type { HistoryEntry } from '../types/calculator';

function makeEntry(overrides: Partial<HistoryEntry> = {}): HistoryEntry {
  return {
    id: 1,
    operation: 'add',
    a: 5,
    b: 3,
    result: 8,
    timestamp: new Date().toISOString(),
    ...overrides,
  };
}

describe('History', () => {
  it('renders "No calculations yet" when entries is empty', () => {
    render(<History entries={[]} onSelect={vi.fn()} onClear={vi.fn()} />);
    expect(screen.getByText('No calculations yet')).toBeInTheDocument();
  });

  it('does not show "Clear History" button when entries is empty', () => {
    render(<History entries={[]} onSelect={vi.fn()} onClear={vi.fn()} />);
    expect(screen.queryByText('Clear History')).not.toBeInTheDocument();
  });

  it('renders history entries with correct binary formatting', () => {
    const entries = [
      makeEntry({ id: 1, operation: 'add', a: 5, b: 3, result: 8 }),
      makeEntry({ id: 2, operation: 'subtract', a: 10, b: 4, result: 6 }),
      makeEntry({ id: 3, operation: 'multiply', a: 3, b: 7, result: 21 }),
      makeEntry({ id: 4, operation: 'divide', a: 20, b: 5, result: 4 }),
    ];
    render(<History entries={entries} onSelect={vi.fn()} onClear={vi.fn()} />);
    expect(screen.getByText('5 + 3 = 8')).toBeInTheDocument();
    expect(screen.getByText('10 − 4 = 6')).toBeInTheDocument();
    expect(screen.getByText('3 × 7 = 21')).toBeInTheDocument();
    expect(screen.getByText('20 ÷ 5 = 4')).toBeInTheDocument();
  });

  it('renders unary operation entries correctly', () => {
    const entries = [
      makeEntry({ id: 1, operation: 'sqrt', a: 16, b: undefined, result: 4 }),
      makeEntry({ id: 2, operation: 'sin', a: 0, b: undefined, result: 0 }),
    ];
    render(<History entries={entries} onSelect={vi.fn()} onClear={vi.fn()} />);
    expect(screen.getByText('√16 = 4')).toBeInTheDocument();
    expect(screen.getByText('sin(0) = 0')).toBeInTheDocument();
  });

  it('clicking an entry calls onSelect with the result', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const entries = [makeEntry({ id: 1, result: 42 })];
    render(<History entries={entries} onSelect={onSelect} onClear={vi.fn()} />);
    await user.click(screen.getByText('5 + 3 = 42'));
    expect(onSelect).toHaveBeenCalledWith(42);
  });

  it('clicking "Clear History" calls onClear', async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    const entries = [makeEntry()];
    render(<History entries={entries} onSelect={vi.fn()} onClear={onClear} />);
    await user.click(screen.getByText('Clear History'));
    expect(onClear).toHaveBeenCalled();
  });

  it('shows results for each entry', () => {
    const entries = [
      makeEntry({ id: 1, result: 42 }),
      makeEntry({ id: 2, result: 99 }),
    ];
    render(<History entries={entries} onSelect={vi.fn()} onClear={vi.fn()} />);
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('99')).toBeInTheDocument();
  });
});

describe('formatEntry', () => {
  it('formats binary operations with correct symbols', () => {
    expect(formatEntry(makeEntry({ operation: 'add', a: 1, b: 2, result: 3 }))).toBe('1 + 2 = 3');
    expect(formatEntry(makeEntry({ operation: 'subtract', a: 5, b: 3, result: 2 }))).toBe('5 − 3 = 2');
    expect(formatEntry(makeEntry({ operation: 'multiply', a: 2, b: 3, result: 6 }))).toBe('2 × 3 = 6');
    expect(formatEntry(makeEntry({ operation: 'divide', a: 6, b: 2, result: 3 }))).toBe('6 ÷ 2 = 3');
    expect(formatEntry(makeEntry({ operation: 'power', a: 2, b: 3, result: 8 }))).toBe('2 ^ 3 = 8');
    expect(formatEntry(makeEntry({ operation: 'bitand', a: 5, b: 3, result: 1 }))).toBe('5 & 3 = 1');
    expect(formatEntry(makeEntry({ operation: 'bitor', a: 5, b: 3, result: 7 }))).toBe('5 | 3 = 7');
    expect(formatEntry(makeEntry({ operation: 'bitxor', a: 5, b: 3, result: 6 }))).toBe('5 XOR 3 = 6');
    expect(formatEntry(makeEntry({ operation: 'lshift', a: 1, b: 3, result: 8 }))).toBe('1 << 3 = 8');
    expect(formatEntry(makeEntry({ operation: 'rshift', a: 8, b: 3, result: 1 }))).toBe('8 >> 3 = 1');
    expect(formatEntry(makeEntry({ operation: 'mod', a: 10, b: 3, result: 1 }))).toBe('10 % 3 = 1');
  });

  it('uses operation name as fallback for unknown binary ops', () => {
    expect(formatEntry(makeEntry({ operation: 'custom', a: 1, b: 2, result: 3 }))).toBe('1 custom 2 = 3');
  });

  it('formats all unary operations correctly', () => {
    expect(formatEntry(makeEntry({ operation: 'sqrt', a: 16, b: undefined, result: 4 }))).toBe('√16 = 4');
    expect(formatEntry(makeEntry({ operation: 'sin', a: 0, b: undefined, result: 0 }))).toBe('sin(0) = 0');
    expect(formatEntry(makeEntry({ operation: 'cos', a: 0, b: undefined, result: 1 }))).toBe('cos(0) = 1');
    expect(formatEntry(makeEntry({ operation: 'tan', a: 0, b: undefined, result: 0 }))).toBe('tan(0) = 0');
    expect(formatEntry(makeEntry({ operation: 'ln', a: 1, b: undefined, result: 0 }))).toBe('ln(1) = 0');
    expect(formatEntry(makeEntry({ operation: 'log10', a: 100, b: undefined, result: 2 }))).toBe('log(100) = 2');
    expect(formatEntry(makeEntry({ operation: 'factorial', a: 5, b: undefined, result: 120 }))).toBe('5! = 120');
    expect(formatEntry(makeEntry({ operation: 'square', a: 4, b: undefined, result: 16 }))).toBe('4² = 16');
    expect(formatEntry(makeEntry({ operation: 'cube', a: 3, b: undefined, result: 27 }))).toBe('3³ = 27');
    expect(formatEntry(makeEntry({ operation: 'reciprocal', a: 4, b: undefined, result: 0.25 }))).toBe('1/4 = 0.25');
    expect(formatEntry(makeEntry({ operation: 'abs', a: -5, b: undefined, result: 5 }))).toBe('|-5| = 5');
    expect(formatEntry(makeEntry({ operation: 'bitnot', a: 5, b: undefined, result: -6 }))).toBe('~5 = -6');
  });

  it('uses default format for unknown unary operations', () => {
    expect(formatEntry(makeEntry({ operation: 'unknown', a: 5, b: undefined, result: 10 }))).toBe('unknown(5) = 10');
  });
});

describe('formatTimestamp', () => {
  it('returns "just now" for timestamps less than 60 seconds ago', () => {
    const ts = new Date().toISOString();
    expect(formatTimestamp(ts)).toBe('just now');
  });

  it('returns minutes ago for timestamps less than 60 minutes ago', () => {
    const date = new Date(Date.now() - 5 * 60 * 1000);
    expect(formatTimestamp(date.toISOString())).toBe('5m ago');
  });

  it('returns hours ago for timestamps less than 24 hours ago', () => {
    const date = new Date(Date.now() - 3 * 60 * 60 * 1000);
    expect(formatTimestamp(date.toISOString())).toBe('3h ago');
  });

  it('returns date string for timestamps more than 24 hours ago', () => {
    const date = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    const result = formatTimestamp(date.toISOString());
    expect(result).toBe(date.toLocaleDateString());
  });
});
