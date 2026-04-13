import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the api so useCalculator never does real fetches
vi.mock('./services/api', () => ({
  calculate: vi.fn().mockResolvedValue(0),
  calculateUnary: vi.fn().mockResolvedValue(0),
}));

describe('App', () => {
  it('renders "Sezzle Calculator" heading', () => {
    render(<App />);
    expect(screen.getByText('Sezzle Calculator')).toBeInTheDocument();
  });

  it('renders the Calculator component', () => {
    render(<App />);
    // Calculator renders display with "0" and basic buttons
    // "0" appears in both the display and the 0 button; use getAllByText
    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.getByText('=')).toBeInTheDocument();
  });
});
