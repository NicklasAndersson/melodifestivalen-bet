import { Star } from '@phosphor-icons/react';
import { motion } from 'framer-motion';

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  size?: number;
  disabled?: boolean;
}

export function StarRating({ value, onChange, size = 32, disabled = false }: StarRatingProps) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.button
          key={star}
          type="button"
          onClick={() => !disabled && onChange(star)}
          className={`focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
          whileHover={!disabled ? { scale: 1.15 } : {}}
          whileTap={!disabled ? { scale: 0.95 } : {}}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          disabled={disabled}
        >
          <Star
            size={size}
            weight={star <= value ? 'fill' : 'regular'}
            className={star <= value ? 'text-gold' : 'text-muted-foreground'}
          />
        </motion.button>
      ))}
    </div>
  );
}
