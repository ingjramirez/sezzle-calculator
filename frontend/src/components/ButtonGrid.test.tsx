import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ButtonGrid from './ButtonGrid';

function createProps() {
  return {
    inputDigit: vi.fn(),
    inputDecimal: vi.fn(),
    setOperation: vi.fn(),
    calculate: vi.fn(),
    clear: vi.fn(),
    toggleSign: vi.fn(),
    percentage: vi.fn(),
  };
}

describe('ButtonGrid', () => {
  it('renders all basic calculator buttons', () => {
    const props = createProps();
    render(<ButtonGrid {...props} />);
    ['C', '+/-', '%', '÷', '7', '8', '9', '×', '4', '5', '6', '−', '1', '2', '3', '+', '0', '.', '='].forEach(
      (label) => {
        expect(screen.getByText(label)).toBeInTheDocument();
      },
    );
  });

  it('clicking digit buttons calls inputDigit with correct digit', async () => {
    const user = userEvent.setup();
    const props = createProps();
    render(<ButtonGrid {...props} />);
    for (const digit of ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']) {
      await user.click(screen.getByText(digit));
    }
    expect(props.inputDigit).toHaveBeenCalledWith('0');
    expect(props.inputDigit).toHaveBeenCalledWith('1');
    expect(props.inputDigit).toHaveBeenCalledWith('2');
    expect(props.inputDigit).toHaveBeenCalledWith('3');
    expect(props.inputDigit).toHaveBeenCalledWith('4');
    expect(props.inputDigit).toHaveBeenCalledWith('5');
    expect(props.inputDigit).toHaveBeenCalledWith('6');
    expect(props.inputDigit).toHaveBeenCalledWith('7');
    expect(props.inputDigit).toHaveBeenCalledWith('8');
    expect(props.inputDigit).toHaveBeenCalledWith('9');
  });

  it('clicking operator buttons calls setOperation', async () => {
    const user = userEvent.setup();
    const props = createProps();
    render(<ButtonGrid {...props} />);
    await user.click(screen.getByText('÷'));
    expect(props.setOperation).toHaveBeenCalledWith('divide');
    await user.click(screen.getByText('×'));
    expect(props.setOperation).toHaveBeenCalledWith('multiply');
    await user.click(screen.getByText('−'));
    expect(props.setOperation).toHaveBeenCalledWith('subtract');
    await user.click(screen.getByText('+'));
    expect(props.setOperation).toHaveBeenCalledWith('add');
  });

  it('clicking = calls calculate', async () => {
    const user = userEvent.setup();
    const props = createProps();
    render(<ButtonGrid {...props} />);
    await user.click(screen.getByText('='));
    expect(props.calculate).toHaveBeenCalledTimes(1);
  });

  it('clicking C calls clear', async () => {
    const user = userEvent.setup();
    const props = createProps();
    render(<ButtonGrid {...props} />);
    await user.click(screen.getByText('C'));
    expect(props.clear).toHaveBeenCalledTimes(1);
  });

  it('clicking +/- calls toggleSign', async () => {
    const user = userEvent.setup();
    const props = createProps();
    render(<ButtonGrid {...props} />);
    await user.click(screen.getByText('+/-'));
    expect(props.toggleSign).toHaveBeenCalledTimes(1);
  });

  it('clicking % calls percentage', async () => {
    const user = userEvent.setup();
    const props = createProps();
    render(<ButtonGrid {...props} />);
    await user.click(screen.getByText('%'));
    expect(props.percentage).toHaveBeenCalledTimes(1);
  });

  it('clicking . calls inputDecimal', async () => {
    const user = userEvent.setup();
    const props = createProps();
    render(<ButtonGrid {...props} />);
    await user.click(screen.getByText('.'));
    expect(props.inputDecimal).toHaveBeenCalledTimes(1);
  });
});
