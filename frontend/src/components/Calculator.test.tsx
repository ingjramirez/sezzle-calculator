import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Calculator from './Calculator';

// Mock the api so useCalculator never does real fetches
vi.mock('../services/api', () => ({
  calculate: vi.fn().mockResolvedValue({ result: 0 }),
  calculateUnary: vi.fn().mockResolvedValue({ result: 0 }),
  evaluate: vi.fn().mockResolvedValue({ result: 0 }),
  getHistory: vi.fn().mockResolvedValue([]),
  clearHistory: vi.fn().mockResolvedValue(undefined),
}));

import { getHistory, clearHistory as apiClearHistory, calculate as apiCalculate, calculateUnary as apiCalculateUnary } from '../services/api';

const mockedGetHistory = vi.mocked(getHistory);
const mockedClearHistory = vi.mocked(apiClearHistory);
const mockedCalculate = vi.mocked(apiCalculate);
const mockedCalculateUnary = vi.mocked(apiCalculateUnary);

beforeEach(() => {
  vi.clearAllMocks();
  mockedCalculate.mockResolvedValue({ result: 0 });
  mockedCalculateUnary.mockResolvedValue({ result: 0 });
  mockedGetHistory.mockResolvedValue([]);
  mockedClearHistory.mockResolvedValue(undefined);
});

describe('Calculator', () => {
  it('renders in basic mode by default', () => {
    render(<Calculator />);
    // Basic mode has ( ) buttons and no scientific buttons
    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.getByText('=')).toBeInTheDocument();
    expect(screen.getByText('(')).toBeInTheDocument();
    expect(screen.getByText(')')).toBeInTheDocument();
    expect(screen.queryByText('sin')).not.toBeInTheDocument();
    expect(screen.queryByText('AND')).not.toBeInTheDocument();
  });

  it('switching to Scientific shows scientific grid', async () => {
    const user = userEvent.setup();
    render(<Calculator />);
    await user.click(screen.getByText('Scientific'));
    expect(screen.getByText('sin')).toBeInTheDocument();
    expect(screen.getByText('cos')).toBeInTheDocument();
    expect(screen.getByText('tan')).toBeInTheDocument();
    expect(screen.getByText('π')).toBeInTheDocument();
  });

  it('switching to Programmer shows programmer grid', async () => {
    const user = userEvent.setup();
    render(<Calculator />);
    await user.click(screen.getByText('Programmer'));
    expect(screen.getByText('AND')).toBeInTheDocument();
    expect(screen.getByText('OR')).toBeInTheDocument();
    expect(screen.getByText('HEX')).toBeInTheDocument();
    expect(screen.getByText('BIN')).toBeInTheDocument();
  });

  it('switching back to Basic from Programmer works', async () => {
    const user = userEvent.setup();
    render(<Calculator />);
    await user.click(screen.getByText('Programmer'));
    expect(screen.getByText('AND')).toBeInTheDocument();
    await user.click(screen.getByText('Basic'));
    expect(screen.queryByText('AND')).not.toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
  });

  it('display is present', () => {
    render(<Calculator />);
    // "0" appears in both the display div and the 0 button; use getAllByText
    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBeGreaterThanOrEqual(1);
  });

  it('fetches history on mount', async () => {
    render(<Calculator />);
    await waitFor(() => {
      expect(mockedGetHistory).toHaveBeenCalled();
    });
  });

  it('renders display area without history entries when empty', async () => {
    render(<Calculator />);
    await waitFor(() => {
      expect(mockedGetHistory).toHaveBeenCalled();
    });
    // No history entries or clear button when empty
    expect(screen.queryByText('Clear History')).not.toBeInTheDocument();
  });

  it('renders history entries when API returns data', async () => {
    mockedGetHistory.mockResolvedValueOnce([
      { id: 1, operation: 'add', a: 2, b: 3, result: 5, timestamp: new Date().toISOString() },
    ]);
    render(<Calculator />);
    await waitFor(() => {
      expect(screen.getByText('2 + 3 = 5')).toBeInTheDocument();
    });
  });

  it('clears history when Clear History is clicked', async () => {
    const user = userEvent.setup();
    mockedGetHistory.mockResolvedValueOnce([
      { id: 1, operation: 'add', a: 2, b: 3, result: 5, timestamp: new Date().toISOString() },
    ]);
    render(<Calculator />);
    await waitFor(() => {
      expect(screen.getByText('Clear History')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Clear History'));
    expect(mockedClearHistory).toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.queryByText('2 + 3 = 5')).not.toBeInTheDocument();
    });
  });

  it('handles getHistory failure gracefully', async () => {
    mockedGetHistory.mockRejectedValueOnce(new Error('network error'));
    render(<Calculator />);
    // Should still render without crashing
    await waitFor(() => {
      expect(mockedGetHistory).toHaveBeenCalled();
    });
    expect(screen.getByText('C')).toBeInTheDocument();
  });

  it('handles clearHistory failure gracefully', async () => {
    const user = userEvent.setup();
    mockedGetHistory.mockResolvedValueOnce([
      { id: 1, operation: 'add', a: 1, b: 2, result: 3, timestamp: new Date().toISOString() },
    ]);
    mockedClearHistory.mockRejectedValueOnce(new Error('server error'));
    render(<Calculator />);
    await waitFor(() => {
      expect(screen.getByText('Clear History')).toBeInTheDocument();
    });
    // Should not crash
    await user.click(screen.getByText('Clear History'));
    // History entries should remain since clear failed
    expect(screen.getByText('1 + 2 = 3')).toBeInTheDocument();
  });

  it('refreshes history after a binary calculation', async () => {
    const user = userEvent.setup();
    mockedCalculate.mockResolvedValue({ result: 8 });
    render(<Calculator />);
    // Wait for initial history fetch
    await waitFor(() => {
      expect(mockedGetHistory).toHaveBeenCalledTimes(1);
    });
    // Type 5 + 3 =
    await user.click(screen.getByText('5'));
    await user.click(screen.getByText('+'));
    await user.click(screen.getByText('3'));
    await user.click(screen.getByText('='));
    // Should fetch history again after calculation
    await waitFor(() => {
      expect(mockedGetHistory).toHaveBeenCalledTimes(2);
    });
  });

  it('refreshes history after a unary operation', async () => {
    const user = userEvent.setup();
    mockedCalculateUnary.mockResolvedValue({ result: 3 });
    render(<Calculator />);
    // Wait for initial history fetch
    await waitFor(() => {
      expect(mockedGetHistory).toHaveBeenCalledTimes(1);
    });
    // Switch to scientific mode and use sqrt
    await user.click(screen.getByText('Scientific'));
    await user.click(screen.getByText('9'));
    await user.click(screen.getByText('√x'));
    // Should fetch history again after unary operation
    await waitFor(() => {
      expect(mockedGetHistory).toHaveBeenCalledTimes(2);
    });
  });
});
