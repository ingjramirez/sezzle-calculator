import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Display from './Display';

describe('Display', () => {
  it('shows value', () => {
    render(<Display expression="" value="42" />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('shows expression', () => {
    render(<Display expression="5 + " value="5" />);
    expect(screen.getByText('5 +')).toBeInTheDocument();
  });

  it('uses smaller text for long values (>9 chars)', () => {
    render(<Display expression="" value="1234567890" />);
    const valueEl = screen.getByText('1234567890');
    expect(valueEl.className).toContain('text-2xl');
    expect(valueEl.className).not.toContain('text-4xl');
  });

  it('uses larger text for short values (<=9 chars)', () => {
    render(<Display expression="" value="123" />);
    const valueEl = screen.getByText('123');
    expect(valueEl.className).toContain('text-4xl');
  });

  it('shows hex prefix for base 16', () => {
    render(<Display expression="" value="255" base={16} />);
    expect(screen.getByText('0xFF')).toBeInTheDocument();
  });

  it('shows octal prefix for base 8', () => {
    render(<Display expression="" value="8" base={8} />);
    expect(screen.getByText('0o10')).toBeInTheDocument();
  });

  it('shows binary prefix for base 2', () => {
    render(<Display expression="" value="5" base={2} />);
    expect(screen.getByText('0b101')).toBeInTheDocument();
  });

  it('shows value as-is for base 10', () => {
    render(<Display expression="" value="42" base={10} />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('passes through non-numeric values unchanged in any base', () => {
    render(<Display expression="" value="Error" base={16} />);
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('handles default base (10) when not provided', () => {
    render(<Display expression="" value="99" />);
    expect(screen.getByText('99')).toBeInTheDocument();
  });

  it('handles unknown base by returning value as-is', () => {
    render(<Display expression="" value="42" base={3} />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('truncates decimal for non-base-10 display', () => {
    render(<Display expression="" value="10.7" base={16} />);
    expect(screen.getByText('0xA')).toBeInTheDocument();
  });

  it('renders history entries when provided', () => {
    const history = [
      { id: 1, operation: 'add', a: 1, b: 2, result: 3, timestamp: new Date().toISOString() },
    ];
    render(<Display expression="" value="3" history={history} />);
    expect(screen.getByText('1 + 2 = 3')).toBeInTheDocument();
  });

  it('calls onHistorySelect when a history entry is clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const history = [
      { id: 1, operation: 'add', a: 1, b: 2, result: 3, timestamp: new Date().toISOString() },
    ];
    render(<Display expression="" value="3" history={history} onHistorySelect={onSelect} />);
    await user.click(screen.getByText('1 + 2 = 3'));
    expect(onSelect).toHaveBeenCalledWith(3);
  });

  it('shows Clear History button when history exists and calls onClearHistory', async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    const history = [
      { id: 1, operation: 'add', a: 1, b: 2, result: 3, timestamp: new Date().toISOString() },
    ];
    render(<Display expression="" value="3" history={history} onClearHistory={onClear} />);
    const clearBtn = screen.getByText('Clear History');
    expect(clearBtn).toBeInTheDocument();
    await user.click(clearBtn);
    expect(onClear).toHaveBeenCalled();
  });

  it('does not show Clear History when history is empty', () => {
    render(<Display expression="" value="0" history={[]} />);
    expect(screen.queryByText('Clear History')).not.toBeInTheDocument();
  });

  it('shows newest history entry at the bottom', () => {
    // API returns newest first: [id=2, id=1]
    const history = [
      { id: 2, operation: 'multiply', a: 3, b: 4, result: 12, timestamp: new Date().toISOString() },
      { id: 1, operation: 'add', a: 1, b: 2, result: 3, timestamp: new Date().toISOString() },
    ];
    render(<Display expression="" value="12" history={history} />);
    const items = screen.getAllByRole('listitem');
    // Reversed for display: oldest (id=1) at top, newest (id=2) at bottom
    expect(items[0]).toHaveTextContent('1 + 2 = 3');
    expect(items[1]).toHaveTextContent('3 \u00d7 4 = 12');
  });
});
