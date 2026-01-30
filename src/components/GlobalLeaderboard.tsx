import { Entry } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkle, Star, Trophy, Medal, Crown, LinkSimple, Globe } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { getMellopediaUrl } from '@/lib/melodifestivalen-data';

interface GlobalLeaderboardProps {
  entries: Entry[];
}

export function GlobalLeaderboard({ entries }: GlobalLeaderboardProps) {
  const entriesWithGlobalAverage = entries
    .map((entry) => {
      if (entry.userRatings.length === 0) {
        return { entry, average: 0, ratingsCount: 0 };
      }

      const totalScore = entry.userRatings.reduce((sum, ur) => sum + ur.totalScore, 0);
      const average = totalScore / entry.userRatings.length;

      return { entry, average, ratingsCount: entry.userRatings.length };
    })
    .filter((item) => item.ratingsCount > 0)
    .sort((a, b) => b.average - a.average)
    .slice(0, 10);

  if (entriesWithGlobalAverage.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6">
          <Globe size={48} weight="duotone" className="text-primary" />
        </div>
        <h2 className="font-heading font-bold text-2xl text-foreground mb-3 text-center">
          Ingen topplista än
        </h2>
        <p className="font-body text-muted-foreground text-center max-w-md">
          Börja betygsätta bidragen för att se vilka som ligger i topp globalt
        </p>
      </div>
    );
  }

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 0:
        return <Crown size={24} weight="fill" className="text-gold" />;
      case 1:
        return <Medal size={24} weight="fill" className="text-[#87CEEB]" />;
      case 2:
        return <Medal size={24} weight="fill" className="text-[#CD7F32]" />;
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
      {entriesWithGlobalAverage.map((item, index) => (
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
                ? 'border-[#87CEEB]/30 bg-gradient-to-br from-[#87CEEB]/5 to-transparent'
                : index === 2
                ? 'border-[#CD7F32]/30 bg-gradient-to-br from-[#CD7F32]/5 to-transparent'
                : 'border-border'
            }`}
          >
            <div className="flex items-center gap-6">
              <div className="flex items-center justify-center w-16 h-16 shrink-0">
                {getPositionIcon(index)}
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
                          weight={i < Math.round(item.average / 6) ? 'fill' : 'regular'}
                          className={
                            i < Math.round(item.average / 6)
                              ? 'text-gold'
                              : 'text-muted-foreground/40'
                          }
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground font-body">
                      {item.ratingsCount} {item.ratingsCount === 1 ? 'betyg' : 'betyg'} från alla användare
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Sparkle size={20} weight="fill" className="text-gold" />
                    <span className="font-heading font-bold text-2xl text-foreground">
                      {item.average.toFixed(1)}
                    </span>
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
