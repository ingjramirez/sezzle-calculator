import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ModeSelector from './ModeSelector';

describe('ModeSelector', () => {
  it('renders all three mode buttons', () => {
    render(<ModeSelector activeMode="basic" onModeChange={() => {}} />);
    expect(screen.getByText('Basic')).toBeInTheDocument();
    expect(screen.getByText('Scientific')).toBeInTheDocument();
    expect(screen.getByText('Programmer')).toBeInTheDocument();
  });

  it('active mode has highlighted style', () => {
    render(<ModeSelector activeMode="scientific" onModeChange={() => {}} />);
    const scientificBtn = screen.getByText('Scientific');
    expect(scientificBtn.className).toContain('text-white');
    expect(scientificBtn.className).toContain('border-[#ff9500]');

    const basicBtn = screen.getByText('Basic');
    expect(basicBtn.className).toContain('text-[#a1a1a6]');
  });

  it('clicking a mode calls onModeChange', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<ModeSelector activeMode="basic" onModeChange={handleChange} />);
    await user.click(screen.getByText('Programmer'));
    expect(handleChange).toHaveBeenCalledWith('programmer');
  });

  it('no modes are disabled', () => {
    render(<ModeSelector activeMode="basic" onModeChange={() => {}} />);
    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      expect(button).not.toBeDisabled();
    });
  });
});
