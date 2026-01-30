import { Entry } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkle, Star, Trophy, Medal, Crown, Heart, LinkSimple } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { getMellopediaUrl } from '@/lib/melodifestivalen-data';

interface PersonalLeaderboardProps {
  entries: Entry[];
  userId: string;
}

export function PersonalLeaderboard({ entries, userId }: PersonalLeaderboardProps) {
  const entriesWithUserRating = entries
    .map((entry) => {
      const userRating = entry.userRatings.find((ur) => ur.profileId === userId);
      
      if (!userRating) {
        return null;
      }

      return { entry, rating: userRating };
    })
    .filter((item): item is { entry: Entry; rating: NonNullable<typeof item>['rating'] } => item !== null)
    .sort((a, b) => b.rating.totalScore - a.rating.totalScore)
    .slice(0, 10);

  if (entriesWithUserRating.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center mb-6">
          <Heart size={48} weight="duotone" className="text-accent" />
        </div>
        <h2 className="font-heading font-bold text-2xl text-foreground mb-3 text-center">
          Inga betyg än
        </h2>
        <p className="font-body text-muted-foreground text-center max-w-md">
          Börja betygsätta bidragen för att se dina favoriter
        </p>
      </div>
    );
  }

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 0:
        return <Crown size={24} weight="fill" className="text-gold" />;
      case 1:
        return <Medal size={24} weight="fill" className="text-[oklch(0.7_0.1_200)]" />;
      case 2:
        return <Medal size={24} weight="fill" className="text-[oklch(0.6_0.12_30)]" />;
      default:
        return (
          <span className="font-heading font-bold text-2xl text-muted-foreground">
            {position + 1}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {entriesWithUserRating.map((item, index) => (
        <motion.div
          key={item.entry.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <Card
            className={`p-6 border-2 relative overflow-hidden ${
              index === 0
                ? 'border-gold/50 bg-gradient-to-br from-gold/10 via-gold/5 to-transparent'
                : index === 1
                ? 'border-[oklch(0.7_0.1_200)]/30 bg-gradient-to-br from-[oklch(0.7_0.1_200)]/5 to-transparent'
                : index === 2
                ? 'border-[oklch(0.6_0.12_30)]/30 bg-gradient-to-br from-[oklch(0.6_0.12_30)]/5 to-transparent'
                : 'border-border'
            }`}
          >
            <div className="flex items-center gap-6">
              <div className="flex items-center justify-center w-16 h-16 shrink-0">
                {getPositionIcon(index)}
              </div>

              <div className="flex gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0">
                  <span className="font-heading font-bold text-foreground text-base">
                    {item.entry.number}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <h3 className="font-heading font-bold text-xl text-foreground truncate">
                          {item.entry.song}
                        </h3>
                        <a
                          href={getMellopediaUrl(item.entry.song)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80 transition-colors shrink-0"
                          title="Öppna på Mellopedia"
                        >
                          <LinkSimple size={18} weight="bold" />
                        </a>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-muted-foreground font-body text-sm truncate">
                          {item.entry.artist}
                        </p>
                        <a
                          href={getMellopediaUrl(item.entry.artist)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80 transition-colors shrink-0"
                          title="Öppna artist på Mellopedia"
                        >
                          <LinkSimple size={16} weight="bold" />
                        </a>
                      </div>
                    </div>
                    <Badge variant="secondary" className="shrink-0 font-body">
                      {item.entry.heat}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            weight={i < Math.round(item.rating.totalScore / 6) ? 'fill' : 'regular'}
                            className={
                              i < Math.round(item.rating.totalScore / 6)
                                ? 'text-gold'
                                : 'text-muted-foreground/40'
                            }
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground font-body">
                        Ditt betyg
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Sparkle size={20} weight="fill" className="text-gold" />
                      <span className="font-heading font-bold text-2xl text-foreground">
                        {item.rating.totalScore}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
