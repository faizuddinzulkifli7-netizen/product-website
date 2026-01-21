'use client';

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

const sizeStyles = {
  sm: {
    button: 'w-6 h-6 text-sm',
    input: 'w-12 text-sm py-1',
  },
  md: {
    button: 'w-8 h-8',
    input: 'w-16 py-1',
  },
  lg: {
    button: 'w-10 h-10',
    input: 'w-20 py-2',
  },
};

export default function QuantitySelector({
  value,
  onChange,
  min = 1,
  max,
  size = 'md',
  disabled = false,
}: QuantitySelectorProps) {
  const styles = sizeStyles[size];

  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (!max || value < max) {
      onChange(value + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value) || min;
    const clampedValue = Math.max(min, max ? Math.min(newValue, max) : newValue);
    onChange(clampedValue);
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        className={`${styles.button} rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
      >
        -
      </button>
      <input
        type="number"
        value={value}
        onChange={handleInputChange}
        min={min}
        max={max}
        disabled={disabled}
        className={`${styles.input} text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
      />
      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || (max !== undefined && value >= max)}
        className={`${styles.button} rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
      >
        +
      </button>
    </div>
  );
}

