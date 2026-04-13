import type { ApiResponse, ApiError } from '../types/calculator';

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
