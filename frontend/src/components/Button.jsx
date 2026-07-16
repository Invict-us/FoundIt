import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const variants = {
  primary:
    'bg-navy-800 hover:bg-navy-700 text-white shadow-navy focus:ring-navy-500/50',
  secondary:
    'bg-teal-500 hover:bg-teal-600 text-white shadow-teal focus:ring-teal-500/50',
  outline:
    'border-2 border-navy-800 dark:border-slate-300 text-navy-800 dark:text-slate-200 hover:bg-navy-800 hover:text-white dark:hover:bg-slate-300 dark:hover:text-slate-900 focus:ring-navy-500/50',
  ghost:
    'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:ring-slate-500/50',
  danger:
    'bg-red-500 hover:bg-red-600 text-white shadow-sm focus:ring-red-500/50',
  'outline-white':
    'border-2 border-white/80 text-white hover:bg-white hover:text-navy-800 focus:ring-white/50',
  white:
    'bg-white text-navy-900 hover:bg-slate-100 shadow-sm focus:ring-white/50',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-lg gap-2',
  lg: 'px-7 py-3.5 text-base rounded-xl gap-2.5',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconRight: IconRight,
  className = '',
  type = 'button',
  onClick,
  ...rest
}) {
  const isDisabled = disabled || loading;

  return (
    <motion.button
      whileHover={!isDisabled ? { scale: 1.02 } : undefined}
      whileTap={!isDisabled ? { scale: 0.98 } : undefined}
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 ${
        variants[variant] || variants.primary
      } ${sizes[size] || sizes.md} ${
        isDisabled ? 'opacity-60 cursor-not-allowed' : ''
      } ${className}`}
      {...rest}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      {children}
      {!loading && IconRight && <IconRight className="w-4 h-4" />}
    </motion.button>
  );
}
