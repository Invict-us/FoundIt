import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function Input({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  hint,
  required = false,
  disabled = false,
  icon: Icon,
  options = [],
  rows = 4,
  className = '',
  ...rest
}) {
  const [showPassword, setShowPassword] = useState(false);

  const baseInputClasses = `w-full px-4 py-3 rounded-lg border bg-white dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 dark:focus:border-teal-500 ${
    error
      ? 'border-red-400 dark:border-red-500 focus:ring-red-500/50 focus:border-red-500'
      : 'border-slate-300 dark:border-slate-600'
  } ${Icon ? 'pl-11' : ''} ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-50 dark:bg-slate-800' : ''}`;

  const inputId = `input-${name}`;

  const renderField = () => {
    // Select
    if (type === 'select') {
      return (
        <div className="relative">
          {Icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none">
              <Icon className="w-5 h-5" />
            </div>
          )}
          <select
            id={inputId}
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            required={required}
            className={`${baseInputClasses} appearance-none cursor-pointer pr-10`}
            {...rest}
          >
            <option value="" disabled>
              {placeholder || 'Select an option'}
            </option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-5 h-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      );
    }

    // Textarea
    if (type === 'textarea') {
      return (
        <textarea
          id={inputId}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          rows={rows}
          className={`${baseInputClasses} resize-none`}
          {...rest}
        />
      );
    }

    // Password
    if (type === 'password') {
      return (
        <div className="relative">
          {Icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none">
              <Icon className="w-5 h-5" />
            </div>
          )}
          <input
            id={inputId}
            type={showPassword ? 'text' : 'password'}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            className={`${baseInputClasses} pr-11`}
            {...rest}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      );
    }

    // Default text/email/etc
    return (
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          id={inputId}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={baseInputClasses}
          {...rest}
        />
      </div>
    );
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      {renderField()}
      {hint && !error && (
        <p className="text-xs text-slate-400 dark:text-slate-500">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
          <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
