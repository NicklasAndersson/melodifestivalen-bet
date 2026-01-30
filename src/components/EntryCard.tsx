import { Entry, UserRating } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkle, Star, LockKey, LinkSimple } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { isVotingAllowed, getMellopediaUrl } from '@/lib/melodifestivalen-data';

interface EntryCardProps {
  entry: Entry;
  userRating?: UserRating;
  onClick: () => void;
}

export function EntryCard({ entry, userRating, onClick }: EntryCardProps) {
  const totalScore = userRating?.totalScore || 0;
  const ratedCategories = userRating 
    ? Object.values(userRating.ratings).filter(r => r.rating > 0).length 
    : 0;
  const totalCategories = 6;
  const isComplete = ratedCategories === totalCategories;
  const votingAllowed = isVotingAllowed(entry.heatDate);

  return (
    <motion.div
      whileHover={{ y: -4, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        className={`p-6 cursor-pointer border-2 hover:border-primary/50 transition-colors relative overflow-hidden ${!votingAllowed ? 'opacity-75' : ''}`}
        onClick={onClick}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        
        {!votingAllowed && (
          <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
            <LockKey size={18} weight="duotone" className="text-accent" />
          </div>
        )}
        
        <div className="relative">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <h3 className="font-heading font-bold text-xl text-foreground truncate">
                  {entry.song}
                </h3>
                <a
                  href={getMellopediaUrl(entry.song)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-primary hover:text-primary/80 transition-colors shrink-0"
                  title="Öppna på Mellopedia"
                >
                  <LinkSimple size={18} weight="bold" />
                </a>
              </div>
              <div className="flex items-center gap-1.5">
                <p className="text-muted-foreground font-body text-sm truncate">
                  {entry.artist}
                </p>
                <a
                  href={getMellopediaUrl(entry.artist)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-primary hover:text-primary/80 transition-colors shrink-0"
                  title="Öppna artist på Mellopedia"
                >
                  <LinkSimple size={16} weight="bold" />
                </a>
              </div>
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
                    weight={i < Math.round(totalScore / 6) ? 'fill' : 'regular'}
                    className={i < Math.round(totalScore / 6) ? 'text-gold' : 'text-muted-foreground/40'}
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
                {totalScore}
              </span>
            </div>
          </div>

          {!isComplete && ratedCategories > 0 && (
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
