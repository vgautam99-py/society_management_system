import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ 
  label, 
  error, 
  helperText, 
  leftIcon, 
  rightIcon, 
  className = '', 
  id,
  ...props 
}, ref) => {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="text-xs font-medium text-slate-700 ml-0.5">
          {label}
        </label>
      )}
      
      <div className="relative group">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors">
            {leftIcon}
          </div>
        )}
        
        <input
          id={id}
          ref={ref}
          className={`
            w-full px-3 py-2 text-sm bg-white border rounded-lg transition-all duration-200 outline-none
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
            ${error 
              ? 'border-rose-500 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10' 
              : 'border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10'
            }
            disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
          `}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            {rightIcon}
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-[11px] text-rose-500 font-medium ml-0.5">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="text-[11px] text-slate-500 ml-0.5">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
