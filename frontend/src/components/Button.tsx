type ButtonVariant = 'number' | 'operator' | 'function' | 'equals' | 'wide' | 'scientific' | 'programmer' | 'base-active' | 'base-inactive';

interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  number:
    'bg-[#3a3a3c] text-white hover:bg-[#4a4a4c] active:bg-[#505052]',
  operator:
    'bg-[#ff9500] text-white hover:bg-[#ffaa33] active:bg-[#cc7700]',
  function:
    'bg-[#a1a1a6] text-[#1c1c1e] hover:bg-[#b3b3b8] active:bg-[#8e8e93]',
  equals:
    'bg-[#30d158] text-white hover:bg-[#44e06d] active:bg-[#28a745]',
  wide:
    'bg-[#3a3a3c] text-white hover:bg-[#4a4a4c] active:bg-[#505052] col-span-2',
  scientific:
    'bg-[#2a2d5e] text-[#a8b4ff] hover:bg-[#353877] active:bg-[#1e2048]',
  programmer:
    'bg-[#1a3a3a] text-[#5ce0d8] hover:bg-[#244a4a] active:bg-[#143030]',
  'base-active':
    'bg-[#5ce0d8] text-[#1c1c1e] font-bold',
  'base-inactive':
    'bg-[#1a3a3a] text-[#5ce0d8] hover:bg-[#244a4a] active:bg-[#143030]',
};

export default function Button({ label, onClick, variant = 'number', disabled = false }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl text-xl font-semibold h-16 transition-colors duration-100 cursor-pointer select-none ${variantClasses[variant]} ${disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
    >
      {label}
    </button>
  );
}
