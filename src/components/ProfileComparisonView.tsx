import { Entry, CATEGORIES, CategoryKey, UserRating } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Sparkle, MusicNotes, Palette, Television, Microphone, TextAa, Star, LinkSimple } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { getMellopediaUrl } from '@/lib/melodifestivalen-data';

interface ProfileComparisonViewProps {
  entry: Entry;
  currentUserId: string;
  onBack: () => void;
}

const iconMap = {
  MusicNotes,
  Palette,
  Television,
  Microphone,
  TextAa,
};

export function ProfileComparisonView({ entry, currentUserId, onBack }: ProfileComparisonViewProps) {
  const currentUserRating = entry.userRatings.find(ur => ur.profileId === currentUserId);
  const allRatings = entry.userRatings;

  const getCategoryAverage = (category: CategoryKey) => {
    if (allRatings.length === 0) return 0;
    const sum = allRatings.reduce((acc, ur) => acc + ur.ratings[category].rating, 0);
    return (sum / allRatings.length).toFixed(1);
  };

  const getHighestRating = (category: CategoryKey) => {
    if (allRatings.length === 0) return 0;
    return Math.max(...allRatings.map(ur => ur.ratings[category].rating));
  };

  const getLowestRating = (category: CategoryKey) => {
    if (allRatings.length === 0) return 0;
    const ratings = allRatings.map(ur => ur.ratings[category].rating).filter(r => r > 0);
    return ratings.length > 0 ? Math.min(...ratings) : 0;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="shrink-0 border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={onBack}
              className="font-body gap-2 -ml-2"
            >
              <ArrowLeft size={20} />
              Tillbaka till betygsättning
            </Button>
          </div>
          
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0">
                <span className="font-heading font-bold text-foreground text-3xl">
                  {entry.number}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="font-heading font-bold text-3xl text-foreground">
                    {entry.song}
                  </h2>
                  <a
                    href={getMellopediaUrl(entry.song)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 transition-colors"
                    title="Öppna på Mellopedia"
                  >
                    <LinkSimple size={24} weight="bold" />
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-muted-foreground font-body text-lg">
                    {entry.artist}
                  </p>
                  <a
                    href={getMellopediaUrl(entry.artist)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 transition-colors"
                    title="Öppna artist på Mellopedia"
                  >
                    <LinkSimple size={20} weight="bold" />
                  </a>
                </div>
              </div>
            </div>
            <Badge variant="secondary" className="font-body text-base px-3 py-1.5">
              {entry.heat}
            </Badge>
          </div>

          {allRatings.length > 0 && (
            <div className="flex items-center gap-6 mt-6 pt-6 border-t border-border">
              <div className="flex items-center gap-2">
                <Sparkle size={24} weight="fill" className="text-gold" />
                <div>
                  <span className="font-heading font-bold text-3xl text-foreground">
                    {(allRatings.reduce((acc, ur) => acc + ur.totalScore, 0) / allRatings.length).toFixed(1)}
                  </span>
                  <span className="text-muted-foreground font-body text-sm ml-2">
                    genomsnitt
                  </span>
                </div>
              </div>
              <div className="text-muted-foreground font-body text-sm">
                {allRatings.length} {allRatings.length === 1 ? 'profil har betygsatt' : 'profiler har betygsatt'}
              </div>
            </div>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="space-y-6">
            {CATEGORIES.map((category) => {
              const Icon = iconMap[category.icon as keyof typeof iconMap];
              const avgRating = getCategoryAverage(category.key as CategoryKey);
              const highestRating = getHighestRating(category.key as CategoryKey);
              const lowestRating = getLowestRating(category.key as CategoryKey);

              return (
                <motion.div
                  key={category.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="p-6 border-2">
                    <div className="mb-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <Icon size={24} weight="duotone" className="text-primary" />
                          </div>
                          <div>
                            <h3 className="font-heading font-bold text-xl tracking-wide uppercase">
                              {category.label}
                            </h3>
                            <div className="flex items-center gap-4 mt-1">
                              <p className="text-sm text-muted-foreground font-body">
                                Snitt: <span className="font-semibold text-foreground">{avgRating}</span>
                              </p>
                              {highestRating > 0 && (
                                <>
                                  <span className="text-border">•</span>
                                  <p className="text-sm text-muted-foreground font-body">
                                    Högst: <span className="font-semibold text-accent">{highestRating}</span>
                                  </p>
                                </>
                              )}
                              {lowestRating > 0 && (
                                <>
                                  <span className="text-border">•</span>
                                  <p className="text-sm text-muted-foreground font-body">
                                    Lägst: <span className="font-semibold text-muted-foreground">{lowestRating}</span>
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {allRatings.map((rating) => {
                        const categoryRating = rating.ratings[category.key as CategoryKey];
                        const isCurrentUser = rating.profileId === currentUserId;

                        return (
                          <motion.div
                            key={rating.profileId}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Card className={`p-4 h-full ${
                              isCurrentUser 
                                ? 'border-2 border-primary/40 bg-gradient-to-br from-primary/5 to-transparent' 
                                : 'border border-border/50 bg-card/50'
                            }`}>
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    isCurrentUser 
                                      ? 'bg-gradient-to-br from-primary/30 to-accent/30' 
                                      : 'bg-gradient-to-br from-accent/20 to-primary/20'
                                  }`}>
                                    <span className="font-heading font-bold text-foreground text-sm">
                                      {rating.profileName.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <div className="min-w-0">
                                    <p className={`font-heading font-semibold text-sm truncate ${
                                      isCurrentUser ? 'text-primary' : 'text-foreground'
                                    }`}>
                                      {rating.profileName}
                                      {isCurrentUser && <span className="text-xs ml-1">(Du)</span>}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 mb-3">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    size={18}
                                    weight={i < categoryRating.rating ? 'fill' : 'regular'}
                                    className={i < categoryRating.rating ? 'text-gold' : 'text-muted-foreground/30'}
                                  />
                                ))}
                              </div>

                              {categoryRating.comment && (
                                <div className="pt-3 border-t border-border/50">
                                  <p className="text-xs text-muted-foreground font-body line-clamp-3">
                                    {categoryRating.comment}
                                  </p>
                                </div>
                              )}

                              {!categoryRating.rating && !categoryRating.comment && (
                                <div className="pt-3 border-t border-border/50">
                                  <p className="text-xs text-muted-foreground/60 font-body italic">
                                    Inget betyg ännu
                                  </p>
                                </div>
                              )}
                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
