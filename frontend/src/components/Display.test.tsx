import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
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
});
