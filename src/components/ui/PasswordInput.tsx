'use client';

import { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface PasswordInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  name?: string;
  autoComplete?: string;
  minLength?: number;
}

export default function PasswordInput({
  value,
  onChange,
  placeholder = "Enter password",
  className = "",
  disabled = false,
  required = false,
  id,
  name,
  autoComplete = "current-password",
  minLength
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const baseClassName = "w-full pr-12 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors";
  const finalClassName = `${baseClassName} ${className}`;

  return (
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={finalClassName}
        disabled={disabled}
        required={required}
        id={id}
        name={name}
        autoComplete={autoComplete}
        minLength={minLength}
      />
      <button
        type="button"
        onClick={togglePasswordVisibility}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700 p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
        aria-label={showPassword ? "Hide password" : "Show password"}
        tabIndex={0}
      >
        {showPassword ? (
          <EyeSlashIcon className="h-5 w-5" />
        ) : (
          <EyeIcon className="h-5 w-5" />
        )}
      </button>
    </div>
  );
}
