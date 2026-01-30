import { useState, useEffect } from 'react';
import { getTimeUntilHeat, type TimeRemaining } from '@/lib/melodifestivalen-data';
import { motion } from 'framer-motion';

interface CountdownProps {
  heatDate: string;
}

export function Countdown({ heatDate }: CountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(() => 
    getTimeUntilHeat(heatDate)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(getTimeUntilHeat(heatDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [heatDate]);

  if (timeRemaining.totalMs <= 0) {
    return null;
  }

  const timeUnits = [
    { value: timeRemaining.days, label: timeRemaining.days === 1 ? 'dag' : 'dagar' },
    { value: timeRemaining.hours, label: timeRemaining.hours === 1 ? 'timme' : 'timmar' },
    { value: timeRemaining.minutes, label: timeRemaining.minutes === 1 ? 'minut' : 'minuter' },
    { value: timeRemaining.seconds, label: timeRemaining.seconds === 1 ? 'sekund' : 'sekunder' },
  ];

  return (
    <div className="grid grid-cols-4 gap-3 sm:gap-4">
      {timeUnits.map((unit, index) => (
        <motion.div
          key={unit.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="flex flex-col items-center justify-center"
        >
          <div className="relative w-full aspect-square rounded-xl bg-gradient-to-br from-accent/20 to-primary/10 border-2 border-accent/30 flex items-center justify-center mb-2">
            <motion.span
              key={unit.value}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="font-heading font-bold text-2xl sm:text-3xl md:text-4xl text-foreground"
            >
              {String(unit.value).padStart(2, '0')}
            </motion.span>
          </div>
          <span className="font-body text-xs sm:text-sm text-muted-foreground uppercase tracking-wide">
            {unit.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
