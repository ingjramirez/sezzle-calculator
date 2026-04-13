import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ScientificButtonGrid from './ScientificButtonGrid';

function createProps() {
  return {
    inputDigit: vi.fn(),
    inputDecimal: vi.fn(),
    setOperation: vi.fn(),
    calculate: vi.fn(),
    clear: vi.fn(),
    inputParen: vi.fn(),
    unaryOperation: vi.fn(),
    setConstant: vi.fn(),
  };
}

describe('ScientificButtonGrid', () => {
  it('renders all scientific buttons', () => {
    const props = createProps();
    render(<ScientificButtonGrid {...props} />);
    ['sin', 'cos', 'tan', 'π', 'ln', 'log', '√x', 'xʸ', 'x²', 'n!', '1/x', 'e'].forEach(
      (label) => {
        expect(screen.getByText(label)).toBeInTheDocument();
      },
    );
  });

  it('renders all basic buttons including parens', () => {
    const props = createProps();
    render(<ScientificButtonGrid {...props} />);
    ['C', '(', ')', '÷', '7', '8', '9', '×', '4', '5', '6', '−', '1', '2', '3', '+', '0', '.', '='].forEach(
      (label) => {
        expect(screen.getByText(label)).toBeInTheDocument();
      },
    );
  });

  it('clicking sin calls unaryOperation("sin")', async () => {
    const user = userEvent.setup();
    const props = createProps();
    render(<ScientificButtonGrid {...props} />);
    await user.click(screen.getByText('sin'));
    expect(props.unaryOperation).toHaveBeenCalledWith('sin');
  });

  it('clicking cos calls unaryOperation("cos")', async () => {
    const user = userEvent.setup();
    const props = createProps();
    render(<ScientificButtonGrid {...props} />);
    await user.click(screen.getByText('cos'));
    expect(props.unaryOperation).toHaveBeenCalledWith('cos');
  });

  it('clicking tan calls unaryOperation("tan")', async () => {
    const user = userEvent.setup();
    const props = createProps();
    render(<ScientificButtonGrid {...props} />);
    await user.click(screen.getByText('tan'));
    expect(props.unaryOperation).toHaveBeenCalledWith('tan');
  });

  it('clicking ln calls unaryOperation("ln")', async () => {
    const user = userEvent.setup();
    const props = createProps();
    render(<ScientificButtonGrid {...props} />);
    await user.click(screen.getByText('ln'));
    expect(props.unaryOperation).toHaveBeenCalledWith('ln');
  });

  it('clicking log calls unaryOperation("log10")', async () => {
    const user = userEvent.setup();
    const props = createProps();
    render(<ScientificButtonGrid {...props} />);
    await user.click(screen.getByText('log'));
    expect(props.unaryOperation).toHaveBeenCalledWith('log10');
  });

  it('clicking π calls setConstant with Math.PI', async () => {
    const user = userEvent.setup();
    const props = createProps();
    render(<ScientificButtonGrid {...props} />);
    await user.click(screen.getByText('π'));
    expect(props.setConstant).toHaveBeenCalledWith(Math.PI);
  });

  it('clicking xʸ calls setOperation("power")', async () => {
    const user = userEvent.setup();
    const props = createProps();
    render(<ScientificButtonGrid {...props} />);
    await user.click(screen.getByText('xʸ'));
    expect(props.setOperation).toHaveBeenCalledWith('power');
  });

  it('clicking √x calls unaryOperation("sqrt")', async () => {
    const user = userEvent.setup();
    const props = createProps();
    render(<ScientificButtonGrid {...props} />);
    await user.click(screen.getByText('√x'));
    expect(props.unaryOperation).toHaveBeenCalledWith('sqrt');
  });

  it('clicking x² calls unaryOperation("square")', async () => {
    const user = userEvent.setup();
    const props = createProps();
    render(<ScientificButtonGrid {...props} />);
    await user.click(screen.getByText('x²'));
    expect(props.unaryOperation).toHaveBeenCalledWith('square');
  });

  it('clicking n! calls unaryOperation("factorial")', async () => {
    const user = userEvent.setup();
    const props = createProps();
    render(<ScientificButtonGrid {...props} />);
    await user.click(screen.getByText('n!'));
    expect(props.unaryOperation).toHaveBeenCalledWith('factorial');
  });

  it('clicking 1/x calls unaryOperation("reciprocal")', async () => {
    const user = userEvent.setup();
    const props = createProps();
    render(<ScientificButtonGrid {...props} />);
    await user.click(screen.getByText('1/x'));
    expect(props.unaryOperation).toHaveBeenCalledWith('reciprocal');
  });

  it('clicking e calls setConstant with Math.E', async () => {
    const user = userEvent.setup();
    const props = createProps();
    render(<ScientificButtonGrid {...props} />);
    await user.click(screen.getByText('e'));
    expect(props.setConstant).toHaveBeenCalledWith(Math.E);
  });

  it('clicking basic digit buttons calls inputDigit', async () => {
    const user = userEvent.setup();
    const props = createProps();
    render(<ScientificButtonGrid {...props} />);
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

  it('clicking basic operator buttons calls setOperation', async () => {
    const user = userEvent.setup();
    const props = createProps();
    render(<ScientificButtonGrid {...props} />);
    await user.click(screen.getByText('÷'));
    expect(props.setOperation).toHaveBeenCalledWith('divide');
    await user.click(screen.getByText('×'));
    expect(props.setOperation).toHaveBeenCalledWith('multiply');
    await user.click(screen.getByText('−'));
    expect(props.setOperation).toHaveBeenCalledWith('subtract');
    await user.click(screen.getByText('+'));
    expect(props.setOperation).toHaveBeenCalledWith('add');
  });

  it('clicking C calls clear', async () => {
    const user = userEvent.setup();
    const props = createProps();
    render(<ScientificButtonGrid {...props} />);
    await user.click(screen.getByText('C'));
    expect(props.clear).toHaveBeenCalledTimes(1);
  });

  it('clicking ( calls inputParen with "("', async () => {
    const user = userEvent.setup();
    const props = createProps();
    render(<ScientificButtonGrid {...props} />);
    await user.click(screen.getByText('('));
    expect(props.inputParen).toHaveBeenCalledWith('(');
  });

  it('clicking ) calls inputParen with ")"', async () => {
    const user = userEvent.setup();
    const props = createProps();
    render(<ScientificButtonGrid {...props} />);
    await user.click(screen.getByText(')'));
    expect(props.inputParen).toHaveBeenCalledWith(')');
  });

  it('clicking . calls inputDecimal', async () => {
    const user = userEvent.setup();
    const props = createProps();
    render(<ScientificButtonGrid {...props} />);
    await user.click(screen.getByText('.'));
    expect(props.inputDecimal).toHaveBeenCalledTimes(1);
  });

  it('clicking = calls calculate', async () => {
    const user = userEvent.setup();
    const props = createProps();
    render(<ScientificButtonGrid {...props} />);
    await user.click(screen.getByText('='));
    expect(props.calculate).toHaveBeenCalledTimes(1);
  });
});
