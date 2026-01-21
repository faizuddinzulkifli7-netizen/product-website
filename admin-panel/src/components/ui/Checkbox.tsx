import { InputHTMLAttributes } from 'react';

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helperText?: string;
}

export default function Checkbox({
  label,
  helperText,
  className = '',
  id,
  ...props
}: CheckboxProps) {
  const checkboxId = id || props.name;

  return (
    <div className="flex items-start">
      <div className="flex items-center h-5">
        <input
          id={checkboxId}
          type="checkbox"
          className={`h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 ${className}`}
          {...props}
        />
      </div>
      <div className="ml-3 text-sm">
        <label
          htmlFor={checkboxId}
          className="font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
        </label>
        {helperText && (
          <p className="text-gray-500 dark:text-gray-400">{helperText}</p>
        )}
      </div>
    </div>
  );
}

