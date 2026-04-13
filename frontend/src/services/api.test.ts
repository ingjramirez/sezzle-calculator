import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculate, calculateUnary, getHistory, clearHistory } from './api';

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('calculate', () => {
  it('returns result number on successful response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ result: 42, operation: 'add' }),
    });

    const result = await calculate('add', 20, 22);
    expect(result).toBe(42);
    expect(global.fetch).toHaveBeenCalledWith('/api/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operation: 'add', a: 20, b: 22 }),
    });
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
  it('returns result on successful response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ result: 3, operation: 'sqrt' }),
    });

    const result = await calculateUnary('sqrt', 9);
    expect(result).toBe(3);
    expect(global.fetch).toHaveBeenCalledWith('/api/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operation: 'sqrt', a: 9 }),
    });
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
