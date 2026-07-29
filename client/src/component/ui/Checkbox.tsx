import React from 'react';

const Checkbox = ({ label, id, className = '', ...props }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <input
        type="checkbox"
        id={id}
        className="w-4 h-4 text-primary-600 bg-white border-slate-300 rounded focus:ring-primary-500 focus:ring-2 accent-primary-600 transition-all cursor-pointer"
        {...props}
      />
      {label && (
        <label htmlFor={id} className="text-sm text-slate-700 cursor-pointer select-none">
          {label}
        </label>
      )}
    </div>
  );
};

export default Checkbox;
