import type { CalculatorMode } from '../types/calculator';

const modes: { key: CalculatorMode; label: string }[] = [
  { key: 'basic', label: 'Basic' },
  { key: 'scientific', label: 'Scientific' },
  { key: 'programmer', label: 'Programmer' },
];

interface ModeSelectorProps {
  activeMode: CalculatorMode;
  onModeChange: (mode: CalculatorMode) => void;
}

export default function ModeSelector({ activeMode, onModeChange }: ModeSelectorProps) {
  return (
    <div className="flex bg-[#1c1c1e] rounded-t-2xl overflow-hidden">
      {modes.map(({ key, label }) => {
        const isActive = key === activeMode;

        return (
          <button
            key={key}
            onClick={() => onModeChange(key)}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors duration-150 cursor-pointer
              ${isActive
                ? 'text-white border-b-2 border-[#ff9500]'
                : 'text-[#a1a1a6] border-b-2 border-transparent hover:text-white'
              }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
