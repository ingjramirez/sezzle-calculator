import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from './Button';

describe('Button', () => {
  it('renders label text', () => {
    render(<Button label="7" onClick={() => {}} />);
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button label="5" onClick={handleClick} />);
    await user.click(screen.getByText('5'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies correct class for number variant (default)', () => {
    render(<Button label="1" onClick={() => {}} />);
    const button = screen.getByText('1');
    expect(button.className).toContain('bg-[#3a3a3c]');
  });

  it('applies correct class for operator variant', () => {
    render(<Button label="+" onClick={() => {}} variant="operator" />);
    const button = screen.getByText('+');
    expect(button.className).toContain('bg-[#ff9500]');
  });

  it('applies correct class for function variant', () => {
    render(<Button label="C" onClick={() => {}} variant="function" />);
    const button = screen.getByText('C');
    expect(button.className).toContain('bg-[#a1a1a6]');
  });

  it('applies correct class for equals variant', () => {
    render(<Button label="=" onClick={() => {}} variant="equals" />);
    const button = screen.getByText('=');
    expect(button.className).toContain('bg-[#30d158]');
  });

  it('applies correct class for wide variant', () => {
    render(<Button label="0" onClick={() => {}} variant="wide" />);
    const button = screen.getByText('0');
    expect(button.className).toContain('col-span-2');
  });

  it('applies correct class for scientific variant', () => {
    render(<Button label="sin" onClick={() => {}} variant="scientific" />);
    const button = screen.getByText('sin');
    expect(button.className).toContain('bg-[#2a2d5e]');
  });

  it('applies correct class for programmer variant', () => {
    render(<Button label="AND" onClick={() => {}} variant="programmer" />);
    const button = screen.getByText('AND');
    expect(button.className).toContain('bg-[#1a3a3a]');
  });

  it('applies correct class for base-active variant', () => {
    render(<Button label="DEC" onClick={() => {}} variant="base-active" />);
    const button = screen.getByText('DEC');
    expect(button.className).toContain('bg-[#5ce0d8]');
  });

  it('applies correct class for base-inactive variant', () => {
    render(<Button label="HEX" onClick={() => {}} variant="base-inactive" />);
    const button = screen.getByText('HEX');
    expect(button.className).toContain('bg-[#1a3a3a]');
  });

  it('handles disabled state', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button label="8" onClick={handleClick} disabled />);
    const button = screen.getByText('8');
    expect(button).toBeDisabled();
    expect(button.className).toContain('opacity-30');
    await user.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });
});
