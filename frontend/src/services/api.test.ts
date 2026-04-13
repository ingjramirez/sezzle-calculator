import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculate, calculateUnary, evaluate, getHistory, clearHistory } from './api';

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('calculate', () => {
  it('returns result and resultDisplay on successful response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ result: 42, operation: 'add' }),
    });

    const response = await calculate('add', 20, 22);
    expect(response).toEqual({ result: 42, resultDisplay: undefined });
    expect(global.fetch).toHaveBeenCalledWith('/api/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operation: 'add', a: 20, b: 22 }),
    });
  });

  it('returns resultDisplay when provided by API', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ result: Infinity, resultDisplay: '4.02387\u00d710^2567', operation: 'factorial' }),
    });

    const response = await calculate('factorial', 1000, 0);
    expect(response).toEqual({ result: Infinity, resultDisplay: '4.02387\u00d710^2567' });
  });

  it('throws with error message on server error', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: 'division by zero' }),
    });

    await expect(calculate('divide', 1, 0)).rejects.toThrow('division by zero');
  });

  it('throws with fallback message when server error has no error field', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: '' }),
    });

    await expect(calculate('add', 1, 2)).rejects.toThrow('Server error: 500');
  });

  it('throws with network error on fetch failure', async () => {
    global.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(calculate('add', 1, 2)).rejects.toThrow(
      'Network error: unable to reach the server',
    );
  });
});

describe('calculateUnary', () => {
  it('returns result and resultDisplay on successful response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ result: 3, operation: 'sqrt' }),
    });

    const response = await calculateUnary('sqrt', 9);
    expect(response).toEqual({ result: 3, resultDisplay: undefined });
    expect(global.fetch).toHaveBeenCalledWith('/api/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operation: 'sqrt', a: 9 }),
    });
  });

  it('returns resultDisplay when provided by API', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ result: Infinity, resultDisplay: '4.02387\u00d710^2567', operation: 'factorial' }),
    });

    const response = await calculateUnary('factorial', 1000);
    expect(response).toEqual({ result: Infinity, resultDisplay: '4.02387\u00d710^2567' });
  });

  it('throws with error message on server error', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: 'invalid operation' }),
    });

    await expect(calculateUnary('bad', 1)).rejects.toThrow('invalid operation');
  });

  it('throws with fallback message when server error has no error field', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: () => Promise.resolve({ error: '' }),
    });

    await expect(calculateUnary('sqrt', 1)).rejects.toThrow('Server error: 503');
  });

  it('throws with network error on fetch failure', async () => {
    global.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(calculateUnary('sqrt', 9)).rejects.toThrow(
      'Network error: unable to reach the server',
    );
  });
});

describe('evaluate', () => {
  it('returns result and resultDisplay on successful response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ result: 20, expression: '( 2 + 3 ) * 4' }),
    });

    const response = await evaluate('( 2 + 3 ) * 4');
    expect(response).toEqual({ result: 20, resultDisplay: undefined });
    expect(global.fetch).toHaveBeenCalledWith('/api/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expression: '( 2 + 3 ) * 4' }),
    });
  });

  it('returns resultDisplay when provided by API', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ result: Infinity, resultDisplay: '1.5\u00d710^100', expression: '10 ^ 100 * 1.5' }),
    });

    const response = await evaluate('10 ^ 100 * 1.5');
    expect(response).toEqual({ result: Infinity, resultDisplay: '1.5\u00d710^100' });
  });

  it('throws with error message on server error', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: 'invalid expression' }),
    });

    await expect(evaluate('bad expr')).rejects.toThrow('invalid expression');
  });

  it('throws with fallback message when server error has no error field', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: '' }),
    });

    await expect(evaluate('1 + 2')).rejects.toThrow('Server error: 500');
  });

  it('throws with network error on fetch failure', async () => {
    global.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(evaluate('1 + 2')).rejects.toThrow(
      'Network error: unable to reach the server',
    );
  });
});

describe('getHistory', () => {
  it('returns array of history entries on success', async () => {
    const entries = [
      { id: 1, operation: 'add', a: 1, b: 2, result: 3, timestamp: '2024-01-01T00:00:00Z' },
    ];
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(entries),
    });

    const result = await getHistory();
    expect(result).toEqual(entries);
    expect(global.fetch).toHaveBeenCalledWith('/api/history');
  });

  it('throws with error message on server error', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: 'internal error' }),
    });

    await expect(getHistory()).rejects.toThrow('internal error');
  });

  it('throws with fallback message when server error has no error field', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: '' }),
    });

    await expect(getHistory()).rejects.toThrow('Server error: 500');
  });

  it('throws with network error on fetch failure', async () => {
    global.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(getHistory()).rejects.toThrow(
      'Network error: unable to reach the server',
    );
  });
});

describe('clearHistory', () => {
  it('completes successfully on ok response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ status: 'cleared' }),
    });

    await expect(clearHistory()).resolves.toBeUndefined();
    expect(global.fetch).toHaveBeenCalledWith('/api/history', { method: 'DELETE' });
  });

  it('throws with error message on server error', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: 'cannot clear' }),
    });

    await expect(clearHistory()).rejects.toThrow('cannot clear');
  });

  it('throws with fallback message when server error has no error field', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: () => Promise.resolve({ error: '' }),
    });

    await expect(clearHistory()).rejects.toThrow('Server error: 503');
  });

  it('throws with network error on fetch failure', async () => {
    global.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(clearHistory()).rejects.toThrow(
      'Network error: unable to reach the server',
    );
  });
});
