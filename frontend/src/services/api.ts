import type { ApiResponse, ApiError, HistoryEntry } from '../types/calculator';

export async function evaluate(expression: string): Promise<number> {
  let response: Response;

  try {
    response = await fetch('/api/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expression }),
    });
  } catch {
    throw new Error('Network error: unable to reach the server');
  }

  if (!response.ok) {
    const body = (await response.json()) as ApiError;
    throw new Error(body.error || `Server error: ${response.status}`);
  }

  const data = (await response.json()) as { result: number; expression: string };
  return data.result;
}

export async function calculate(
  operation: string,
  a: number,
  b: number,
): Promise<number> {
  let response: Response;

  try {
    response = await fetch('/api/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operation, a, b }),
    });
  } catch {
    throw new Error('Network error: unable to reach the server');
  }

  if (!response.ok) {
    const body = (await response.json()) as ApiError;
    throw new Error(body.error || `Server error: ${response.status}`);
  }

  const data = (await response.json()) as ApiResponse;
  return data.result;
}

export async function calculateUnary(
  operation: string,
  a: number,
): Promise<number> {
  let response: Response;

  try {
    response = await fetch('/api/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operation, a }),
    });
  } catch {
    throw new Error('Network error: unable to reach the server');
  }

  if (!response.ok) {
    const body = (await response.json()) as ApiError;
    throw new Error(body.error || `Server error: ${response.status}`);
  }

  const data = (await response.json()) as ApiResponse;
  return data.result;
}

export async function getHistory(): Promise<HistoryEntry[]> {
  let response: Response;

  try {
    response = await fetch('/api/history');
  } catch {
    throw new Error('Network error: unable to reach the server');
  }

  if (!response.ok) {
    const body = (await response.json()) as ApiError;
    throw new Error(body.error || `Server error: ${response.status}`);
  }

  return (await response.json()) as HistoryEntry[];
}

export async function clearHistory(): Promise<void> {
  let response: Response;

  try {
    response = await fetch('/api/history', { method: 'DELETE' });
  } catch {
    throw new Error('Network error: unable to reach the server');
  }

  if (!response.ok) {
    const body = (await response.json()) as ApiError;
    throw new Error(body.error || `Server error: ${response.status}`);
  }
}
