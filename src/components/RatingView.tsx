import { Entry, CATEGORIES, CategoryKey } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StarRating } from './StarRating';
import { ArrowLeft, Sparkle, MusicNotes, Palette, Television, Microphone, TextAa } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';

interface RatingViewProps {
  entry: Entry;
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

export function RatingView({ entry, onBack, onUpdateRating }: RatingViewProps) {
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
              {entry.totalScore}
            </span>
            <span className="text-muted-foreground font-body text-sm ml-2">
              / 30 poäng
            </span>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="space-y-6">
            {CATEGORIES.map((category) => {
              const Icon = iconMap[category.icon as keyof typeof iconMap];
              const categoryRating = entry.ratings[category.key as CategoryKey];

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
      </ScrollArea>
    </div>
  );
}
