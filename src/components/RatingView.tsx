import { Entry, CATEGORIES, CategoryKey, UserRating } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { StarRating } from './StarRating';
import { ArrowLeft, Sparkle, MusicNotes, Palette, Television, Microphone, TextAa, Star, Users } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';

interface RatingViewProps {
  entry: Entry;
  userRating?: UserRating;
  currentUserId: string;
  onBack: () => void;
  onUpdateRating: (category: CategoryKey, rating: number, comment: string) => void;
}

const iconMap = {
  MusicNotes,
  Palette,
  Television,
  Microphone,
  TextAa,
};

export function RatingView({ entry, userRating, currentUserId, onBack, onUpdateRating }: RatingViewProps) {
  const totalScore = userRating?.totalScore || 0;
  const otherUserRatings = entry.userRatings.filter(ur => ur.userId !== currentUserId);

  const getRating = (category: CategoryKey) => {
    return userRating?.ratings[category] || { rating: 0, comment: '' };
  };

  return (
    <div className="h-full flex flex-col">
      <div className="shrink-0 border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-4 font-body gap-2 -ml-2"
          >
            <ArrowLeft size={20} />
            Tillbaka
          </Button>
          
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-heading font-bold text-3xl text-foreground mb-2">
                {entry.song}
              </h2>
              <p className="text-muted-foreground font-body text-lg">
                {entry.artist}
              </p>
            </div>
            <Badge variant="secondary" className="font-body text-base px-3 py-1.5">
              {entry.heat}
            </Badge>
          </div>

          <div className="flex items-center gap-2 mt-6 pt-6 border-t border-border">
            <Sparkle size={28} weight="fill" className="text-gold" />
            <span className="font-heading font-bold text-4xl text-foreground">
              {totalScore}
            </span>
            <span className="text-muted-foreground font-body text-sm ml-2">
              / 30 poäng (ditt betyg)
            </span>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="space-y-8">
            <div>
              <h3 className="font-heading font-bold text-2xl text-foreground mb-6 flex items-center gap-2">
                <Users size={28} weight="duotone" className="text-primary" />
                Dina betyg
              </h3>
              <div className="space-y-6">
                {CATEGORIES.map((category) => {
                  const Icon = iconMap[category.icon as keyof typeof iconMap];
                  const categoryRating = getRating(category.key as CategoryKey);

                  return (
                    <motion.div
                      key={category.key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="p-6 border-2">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <Icon size={24} weight="duotone" className="text-primary" />
                          </div>
                          <Label className="font-heading font-semibold text-lg tracking-wide uppercase">
                            {category.label}
                          </Label>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <StarRating
                              value={categoryRating.rating}
                              onChange={(rating) => 
                                onUpdateRating(category.key as CategoryKey, rating, categoryRating.comment)
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`comment-${category.key}`} className="font-body text-sm text-muted-foreground">
                              Kommentar
                            </Label>
                            <Textarea
                              id={`comment-${category.key}`}
                              value={categoryRating.comment}
                              onChange={(e) =>
                                onUpdateRating(category.key as CategoryKey, categoryRating.rating, e.target.value)
                              }
                              placeholder="Skriv dina tankar här..."
                              className="font-body min-h-[100px] resize-none"
                            />
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {otherUserRatings.length > 0 && (
              <>
                <Separator className="my-8" />
                
                <div>
                  <h3 className="font-heading font-bold text-2xl text-foreground mb-6 flex items-center gap-2">
                    <Users size={28} weight="duotone" className="text-accent" />
                    Gruppens betyg
                  </h3>
                  
                  <div className="space-y-6">
                    {otherUserRatings.map((rating, index) => (
                      <motion.div
                        key={rating.userId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Card className="p-6 border-2 border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
                                <span className="font-heading font-bold text-foreground">
                                  {rating.userName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="font-heading font-semibold text-lg text-foreground">
                                  {rating.userName}
                                </p>
                                <p className="text-xs text-muted-foreground font-body">
                                  Totalt: {rating.totalScore} / 30 poäng
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1.5">
                              <Sparkle size={24} weight="fill" className="text-gold" />
                              <span className="font-heading font-bold text-3xl text-foreground">
                                {rating.totalScore}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-4">
                            {CATEGORIES.map((category) => {
                              const Icon = iconMap[category.icon as keyof typeof iconMap];
                              const categoryRating = rating.ratings[category.key as CategoryKey];
                              
                              if (!categoryRating.rating && !categoryRating.comment) return null;

                              return (
                                <div key={category.key} className="border-t border-border/50 pt-4 first:border-t-0 first:pt-0">
                                  <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                      <Icon size={18} weight="duotone" className="text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between mb-2">
                                        <Label className="font-heading font-semibold text-sm uppercase tracking-wide">
                                          {category.label}
                                        </Label>
                                        <div className="flex gap-0.5">
                                          {[...Array(5)].map((_, i) => (
                                            <Star
                                              key={i}
                                              size={16}
                                              weight={i < categoryRating.rating ? 'fill' : 'regular'}
                                              className={i < categoryRating.rating ? 'text-gold' : 'text-muted-foreground/30'}
                                            />
                                          ))}
                                        </div>
                                      </div>
                                      {categoryRating.comment && (
                                        <p className="text-sm text-muted-foreground font-body">
                                          {categoryRating.comment}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
