import { motion } from 'framer-motion';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Card({
  children,
  className = '',
  glass = false,
  hover = true,
  delay = 0,
  onClick,
  as = 'div',
}) {
  const baseClasses = glass
    ? 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border border-white/20 dark:border-slate-700/30'
    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700';

  const Component = motion[as] || motion.div;

  return (
    <Component
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      whileHover={hover ? { scale: 1.02, y: -4 } : undefined}
      onClick={onClick}
      className={`rounded-xl shadow-lg shadow-navy/5 dark:shadow-black/10 ${baseClasses} ${
        hover ? 'cursor-pointer transition-shadow hover:shadow-xl hover:shadow-navy/10 dark:hover:shadow-black/20' : ''
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </Component>
  );
}
