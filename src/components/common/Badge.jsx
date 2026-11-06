import React from 'react';

/**
 * Reusable Badge component for KrishiMitra
 * @param {string} variant - 'emerald' | 'amber' | 'blue' | 'red' | 'purple' | 'slate'
 */
export default function Badge({
  children,
  variant = 'emerald',
  size = 'sm',
  className = '',
  dot = false,
  icon: Icon
}) {
  const variantStyles = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-800 border-amber-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    red: "bg-red-50 text-red-700 border-red-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    slate: "bg-slate-100 text-slate-700 border-slate-200",
    gold: "bg-yellow-50 text-yellow-800 border-yellow-200"
  };

  const dotColors = {
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    blue: "bg-blue-500",
    red: "bg-red-500",
    purple: "bg-purple-500",
    slate: "bg-slate-500",
    gold: "bg-yellow-500"
  };

  const sizeStyles = {
    xs: "px-2 py-0.5 text-[11px]",
    sm: "px-2.5 py-1 text-xs",
    md: "px-3 py-1.5 text-sm"
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${variantStyles[variant] || variantStyles.emerald} ${sizeStyles[size] || sizeStyles.sm} ${className}`}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant] || dotColors.emerald} animate-pulse`} />
      )}
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      <span>{children}</span>
    </span>
  );
}

