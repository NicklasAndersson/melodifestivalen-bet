import { Entry } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkle, Star } from '@phosphor-icons/react';
import { motion } from 'framer-motion';

interface EntryCardProps {
  entry: Entry;
  onClick: () => void;
}

export function EntryCard({ entry, onClick }: EntryCardProps) {
  const ratedCategories = Object.values(entry.ratings).filter(r => r.rating > 0).length;
  const totalCategories = 6;
  const isComplete = ratedCategories === totalCategories;

  return (
    <motion.div
      whileHover={{ y: -4, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        className="p-6 cursor-pointer border-2 hover:border-primary/50 transition-colors relative overflow-hidden"
        onClick={onClick}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        
        <div className="relative">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-heading font-bold text-xl text-foreground mb-1 truncate">
                {entry.song}
              </h3>
              <p className="text-muted-foreground font-body text-sm truncate">
                {entry.artist}
              </p>
            </div>
            <Badge variant="secondary" className="shrink-0 font-body">
              {entry.heat}
            </Badge>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    weight={i < Math.round(entry.totalScore / 6) ? 'fill' : 'regular'}
                    className={i < Math.round(entry.totalScore / 6) ? 'text-gold' : 'text-muted-foreground/40'}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground font-body">
                {ratedCategories}/{totalCategories} kategorier
              </span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <Sparkle size={20} weight="fill" className="text-gold" />
              <span className="font-heading font-bold text-2xl text-foreground">
                {entry.totalScore}
              </span>
            </div>
          </div>

          {!isComplete && (
            <div className="mt-3">
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-accent"
                  initial={{ width: 0 }}
                  animate={{ width: `${(ratedCategories / totalCategories) * 100}%` }}
                  transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                />
              </div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
