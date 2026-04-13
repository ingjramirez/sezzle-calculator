import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Calculator from './Calculator';

// Mock the api so useCalculator never does real fetches
vi.mock('../services/api', () => ({
  calculate: vi.fn().mockResolvedValue(0),
  calculateUnary: vi.fn().mockResolvedValue(0),
}));

describe('Calculator', () => {
  it('renders in basic mode by default', () => {
    render(<Calculator />);
    // Basic mode has % button and no scientific buttons
    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.getByText('=')).toBeInTheDocument();
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
});
