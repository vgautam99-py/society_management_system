import React from 'react';

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {}
interface TheadProps extends React.HTMLAttributes<HTMLTableSectionElement> {}
interface TbodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {}
interface TrProps extends React.HTMLAttributes<HTMLTableRowElement> {
  hover?: boolean;
}
interface ThProps extends React.ThHTMLAttributes<HTMLTableCellElement> {}
interface TdProps extends React.TdHTMLAttributes<HTMLTableCellElement> {}

export const Table = ({ children, className = '', ...props }: TableProps) => (
  <div className="w-full overflow-hidden border border-slate-200 rounded-lg shadow-sm">
    <table className={`w-full text-left border-collapse ${className}`} {...props}>
      {children}
    </table>
  </div>
);

export const Thead = ({ children, className = '', ...props }: TheadProps) => (
  <thead className={`bg-slate-50 border-b border-slate-200 ${className}`} {...props}>
    {children}
  </thead>
);

export const Tbody = ({ children, className = '', ...props }: TbodyProps) => (
  <tbody className={`divide-y divide-slate-200 ${className}`} {...props}>
    {children}
  </tbody>
);

export const Tr = ({ children, className = '', hover = true, ...props }: TrProps) => (
  <tr className={`animate-scale-in ${hover ? 'hover:bg-slate-50' : ''} transition-colors ${className}`} {...props}>
    {children}
  </tr>
);

export const Th = ({ children, className = '', ...props }: ThProps) => (
  <th className={`px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider ${className}`} {...props}>
    {children}
  </th>
);

export const Td = ({ children, className = '', ...props }: TdProps) => (
  <td className={`px-4 py-3 text-sm text-slate-700 ${className}`} {...props}>
    {children}
  </td>
);
