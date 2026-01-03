
import React from 'react';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  currency?: boolean;
  onChange?: (value: string) => void;
}

export const Input: React.FC<InputProps> = ({ label, currency, className, onChange, ...props }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {label && <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</label>}
      <div className="relative">
        {currency && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>}
        <input
          {...props}
          onChange={handleChange}
          className={`w-full bg-white border border-gray-300 text-gray-900 text-base rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2.5 ${currency ? 'pl-7' : ''} transition-colors`}
        />
      </div>
    </div>
  );
};

export const Card: React.FC<{ title: string; children: React.ReactNode; className?: string; color?: string }> = ({ 
  title, 
  children, 
  className = "",
  color = "bg-slate-900"
}) => {
  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col h-full ${className}`}>
      <div className={`${color} text-white px-4 py-2 font-heading font-bold text-lg tracking-wide`}>
        {title}
      </div>
      <div className="p-4 flex-grow flex flex-col gap-3">
        {children}
      </div>
    </div>
  );
};

export const CurrencyValue: React.FC<{ value: number; label?: string; size?: 'sm' | 'md' | 'lg' | 'xl'; negative?: boolean }> = ({ 
  value, 
  label,
  size = 'md',
  negative = false
}) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-3xl',
  };

  // Используем ru-RU для разделения разрядов пробелом
  const formattedValue = Math.abs(value).toLocaleString('ru-RU');
  const displayString = `${value < 0 ? '-' : ''}$${formattedValue}`;

  return (
    <div className="flex flex-col">
      {label && <span className="text-xs text-gray-500 uppercase font-semibold">{label}</span>}
      <span className={`${sizeClasses[size]} font-bold ${negative || value < 0 ? 'text-red-600' : 'text-slate-800'} whitespace-nowrap`}>
        {displayString}
      </span>
    </div>
  );
};
