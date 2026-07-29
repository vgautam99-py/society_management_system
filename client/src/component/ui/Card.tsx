import React from 'react';

const Card = ({ children, title, subtitle, className = '', headerAction }) => {
  return (
    <div className={`bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden ${className}`}>
      {(title || subtitle || headerAction) && (
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            {title && <h3 className="text-base font-semibold text-slate-900">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className="px-6 py-4">
        {children}
      </div>
    </div>
  );
};

export const CardFooter = ({ children, className = '' }) => (
  <div className={`px-6 py-4 bg-slate-50 border-t border-slate-100 ${className}`}>
    {children}
  </div>
);

export default Card;
