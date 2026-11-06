import React from 'react';

/**
 * Reusable Card component for KrishiMitra
 */
export default function Card({
  children,
  className = '',
  hoverEffect = true,
  bordered = true,
  padding = 'p-6',
  onClick,
  ...props
}) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-2xl transition-all duration-300
        ${bordered ? 'border border-slate-100 shadow-sm' : ''}
        ${hoverEffect ? 'hover:shadow-md hover:border-emerald-200 hover:-translate-y-0.5' : ''}
        ${padding}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

