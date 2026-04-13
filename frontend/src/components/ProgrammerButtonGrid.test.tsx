import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProgrammerButtonGrid from './ProgrammerButtonGrid';

function createProps(overrides: Record<string, unknown> = {}) {
  return {
    inputDigit: vi.fn(),
    inputDecimal: vi.fn(),
    setOperation: vi.fn(),
    calculate: vi.fn(),
    clear: vi.fn(),
    inputParen: vi.fn(),
    toggleSign: vi.fn(),
    unaryOperation: vi.fn(),
    setConstant: vi.fn(),
    base: 10,
    onBaseChange: vi.fn(),
    ...overrides,
  };
}

describe('ProgrammerButtonGrid', () => {
  it('renders base selector buttons', () => {
    const props = createProps();
    render(<ProgrammerButtonGrid {...props} />);
    expect(screen.getByText('HEX')).toBeInTheDocument();
    expect(screen.getByText('DEC')).toBeInTheDocument();
    expect(screen.getByText('OCT')).toBeInTheDocument();
    expect(screen.getByText('BIN')).toBeInTheDocument();
  });

  it('renders bitwise buttons', () => {
    const props = createProps();
    render(<ProgrammerButtonGrid {...props} />);
    ['AND', 'OR', 'XOR', 'NOT', '<<', '>>'].forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('renders parenthesis buttons', () => {
    const props = createProps();
    render(<ProgrammerButtonGrid {...props} />);
    expect(screen.getByText('(')).toBeInTheDocument();
    expect(screen.getByText(')')).toBeInTheDocument();
  });

  it('active base is highlighted', () => {
    const props = createProps({ base: 16 });
    render(<ProgrammerButtonGrid {...props} />);
    const hexBtn = screen.getByText('HEX');
    expect(hexBtn.className).toContain('bg-[#5ce0d8]');
    const decBtn = screen.getByText('DEC');
    expect(decBtn.className).toContain('bg-[#1a3a3a]');
  });

  it('clicking AND calls setOperation("bitand")', async () => {
    const user = userEvent.setup();
    const props = createProps();
    render(<ProgrammerButtonGrid {...props} />);
    await user.click(screen.getByText('AND'));
    expect(props.setOperation).toHaveBeenCalledWith('bitand');
  });

  it('clicking OR calls setOperation("bitor")', async () => {
    const user = userEvent.setup();
    const props = createProps();
    render(<ProgrammerButtonGrid {...props} />);
    await user.click(screen.getByText('OR'));
    expect(props.setOperation).toHaveBeenCalledWith('bitor');
  });

  it('clicking XOR calls setOperation("bitxor")', async () => {
    const user = userEvent.setup();
    const props = createProps();
    render(<ProgrammerButtonGrid {...props} />);
    await user.click(screen.getByText('XOR'));
    expect(props.setOperation).toHaveBeenCalledWith('bitxor');
  });

  it('clicking NOT calls unaryOperation("bitnot")', async () => {
    const user = userEvent.setup();
    const props = createProps();
    render(<ProgrammerButtonGrid {...props} />);
    await user.click(screen.getByText('NOT'));
    expect(props.unaryOperation).toHaveBeenCalledWith('bitnot');
  });

  it('clicking << calls setOperation("lshift")', async () => {
    const user = userEvent.setup();
    const props = createProps();
    render(<ProgrammerButtonGrid {...props} />);
    await user.click(screen.getByText('<<'));
    expect(props.setOperation).toHaveBeenCalledWith('lshift');
  });

  it('clicking >> calls setOperation("rshift")', async () => {
    const user = userEvent.setup();
    const props = createProps();
    render(<ProgrammerButtonGrid {...props} />);
    await user.click(screen.getByText('>>'));
    expect(props.setOperation).toHaveBeenCalledWith('rshift');
  });

  it('clicking ( calls inputParen with "("', async () => {
    const user = userEvent.setup();
    const props = createProps();
    render(<ProgrammerButtonGrid {...props} />);
    await user.click(screen.getByText('('));
    expect(props.inputParen).toHaveBeenCalledWith('(');
  });

  it('clicking ) calls inputParen with ")"', async () => {
    const user = userEvent.setup();
    const props = createProps();
    render(<ProgrammerButtonGrid {...props} />);
    await user.click(screen.getByText(')'));
    expect(props.inputParen).toHaveBeenCalledWith(')');
  });

  it('clicking base buttons calls onBaseChange with correct base', async () => {
    const user = userEvent.setup();
    const props = createProps();
    render(<ProgrammerButtonGrid {...props} />);
    await user.click(screen.getByText('HEX'));
    expect(props.onBaseChange).toHaveBeenCalledWith(16);
    await user.click(screen.getByText('DEC'));
    expect(props.onBaseChange).toHaveBeenCalledWith(10);
    await user.click(screen.getByText('OCT'));
    expect(props.onBaseChange).toHaveBeenCalledWith(8);
    await user.click(screen.getByText('BIN'));
    expect(props.onBaseChange).toHaveBeenCalledWith(2);
  });

  it('disables digits >= base in BIN mode (only 0,1 enabled)', () => {
    const props = createProps({ base: 2 });
    render(<ProgrammerButtonGrid {...props} />);
    expect(screen.getByText('0')).not.toBeDisabled();
    expect(screen.getByText('1')).not.toBeDisabled();
    expect(screen.getByText('2')).toBeDisabled();
    expect(screen.getByText('3')).toBeDisabled();
    expect(screen.getByText('4')).toBeDisabled();
    expect(screen.getByText('5')).toBeDisabled();
    expect(screen.getByText('6')).toBeDisabled();
    expect(screen.getByText('7')).toBeDisabled();
    expect(screen.getByText('8')).toBeDisabled();
    expect(screen.getByText('9')).toBeDisabled();
  });

  it('disables digits >= base in OCT mode (0-7 enabled)', () => {
    const props = createProps({ base: 8 });
    render(<ProgrammerButtonGrid {...props} />);
    expect(screen.getByText('0')).not.toBeDisabled();
    expect(screen.getByText('7')).not.toBeDisabled();
    expect(screen.getByText('8')).toBeDisabled();
    expect(screen.getByText('9')).toBeDisabled();
  });

  it('all digits enabled in DEC mode', () => {
    const props = createProps({ base: 10 });
    render(<ProgrammerButtonGrid {...props} />);
    for (let i = 0; i <= 9; i++) {
      expect(screen.getByText(String(i))).not.toBeDisabled();
    }
  });

  it('CLR calls clear', async () => {
    const user = userEvent.setup();
    const props = createProps();
    render(<ProgrammerButtonGrid {...props} />);
    await user.click(screen.getByText('CLR'));
    expect(props.clear).toHaveBeenCalledTimes(1);
  });

  it('clicking ÷ calls setOperation("divide")', async () => {
    const user = userEvent.setup();
    const props = createProps();
    render(<ProgrammerButtonGrid {...props} />);
    await user.click(screen.getByText('÷'));
    expect(props.setOperation).toHaveBeenCalledWith('divide');
  });

  it('clicking × calls setOperation("multiply")', async () => {
    const user = userEvent.setup();
    const props = createProps();
    render(<ProgrammerButtonGrid {...props} />);
    await user.click(screen.getByText('×'));
    expect(props.setOperation).toHaveBeenCalledWith('multiply');
  });

  it('clicking − calls setOperation("subtract")', async () => {
    const user = userEvent.setup();
    const props = createProps();
    render(<ProgrammerButtonGrid {...props} />);
    await user.click(screen.getByText('−'));
    expect(props.setOperation).toHaveBeenCalledWith('subtract');
  });

  it('clicking + calls setOperation("add")', async () => {
    const user = userEvent.setup();
    const props = createProps();
    render(<ProgrammerButtonGrid {...props} />);
    await user.click(screen.getByText('+'));
    expect(props.setOperation).toHaveBeenCalledWith('add');
  });

  it('clicking = calls calculate', async () => {
    const user = userEvent.setup();
    const props = createProps();
    render(<ProgrammerButtonGrid {...props} />);
    await user.click(screen.getByText('='));
    expect(props.calculate).toHaveBeenCalledTimes(1);
  });

  it('clicking ± calls toggleSign', async () => {
    const user = userEvent.setup();
    const props = createProps();
    render(<ProgrammerButtonGrid {...props} />);
    await user.click(screen.getByText('±'));
    expect(props.toggleSign).toHaveBeenCalledTimes(1);
  });

  it('clicking digit buttons calls inputDigit with correct digit (DEC mode)', async () => {
    const user = userEvent.setup();
    const props = createProps({ base: 10 });
    render(<ProgrammerButtonGrid {...props} />);
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
});
