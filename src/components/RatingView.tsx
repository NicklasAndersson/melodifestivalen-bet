import { Entry, CATEGORIES, CategoryKey, UserRating } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { StarRating } from './StarRating';
import { Countdown } from './Countdown';
import { ArrowLeft, Sparkle, MusicNotes, Palette, Television, Microphone, TextAa, Star, Users, CalendarBlank, Clock, LinkSimple, Trash, ChatCircleText } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { isHeatToday, getHeatCity, getHeatVenue, getMellopediaUrl } from '@/lib/melodifestivalen-data';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useState, useRef, useEffect } from 'react';

interface RatingViewProps {
  entry: Entry;
  userRating?: UserRating;
  currentUserId: string;
  onBack: () => void;
  onUpdateRating: (category: CategoryKey, rating: number, comment: string) => void;
  onDeleteRating: () => void;
}

const iconMap = {
  MusicNotes,
  Palette,
  Television,
  Microphone,
  TextAa,
};

export function RatingView({ entry, userRating, currentUserId, onBack, onUpdateRating, onDeleteRating }: RatingViewProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [focusedComment, setFocusedComment] = useState<string | null>(null);
  const textareaRefs = useRef<{ [key: string]: HTMLTextAreaElement | null }>({});
  const totalScore = userRating?.totalScore || 0;
  const otherUserRatings = entry.userRatings.filter(ur => ur.profileId !== currentUserId);
  const heatIsToday = isHeatToday(entry.heatDate);
  const heatCity = getHeatCity(entry.heat);
  const heatVenue = getHeatVenue(entry.heat);
  const hasRatings = userRating && Object.values(userRating.ratings).some(r => r.rating > 0 || r.comment.length > 0);

  useEffect(() => {
    if (focusedComment && textareaRefs.current[focusedComment]) {
      textareaRefs.current[focusedComment]?.focus();
    }
  }, [focusedComment]);

  const getRating = (category: CategoryKey) => {
    return userRating?.ratings[category] || { rating: 0, comment: '' };
  };

  const formatDate = (date: string) => {
    const heatDate = new Date(date + 'T20:00:00');
    return new Intl.DateTimeFormat('sv-SE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Europe/Stockholm',
    }).format(heatDate);
  };

  const handleDeleteConfirm = () => {
    onDeleteRating();
    setDeleteDialogOpen(false);
    onBack();
  };

  return (
    <div className="h-full flex flex-col">
      <div className="shrink-0 border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={onBack}
              className="font-body gap-2 -ml-2"
            >
              <ArrowLeft size={20} />
              Tillbaka
            </Button>
            
            {hasRatings && (
              <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash size={18} weight="duotone" />
                    Radera betyg
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="font-heading">Radera betyg?</AlertDialogTitle>
                    <AlertDialogDescription className="font-body">
                      Är du säker på att du vill radera alla dina betyg för "{entry.song}"? Detta går inte att ångra.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="font-body">Avbryt</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteConfirm}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-body"
                    >
                      Radera
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
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
            {!heatIsToday && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Card className="p-6 border-2 border-accent/30 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent">
                  <div className="mb-4">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                        <Clock size={24} weight="duotone" className="text-accent" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-heading font-bold text-lg text-foreground mb-1">
                          Nedräkning till deltävlingen
                        </h3>
                        <p className="text-muted-foreground font-body text-sm">
                          {formatDate(entry.heatDate)} kl. 20:00
                        </p>
                        {heatCity && heatVenue && (
                          <p className="text-muted-foreground font-body text-sm">
                            {heatVenue}, {heatCity}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <Countdown heatDate={entry.heatDate} />
                </Card>
              </motion.div>
            )}
            
            <div>
              <h3 className="font-heading font-bold text-2xl text-foreground mb-6 flex items-center gap-2">
                <Users size={28} weight="duotone" className="text-primary" />
                Dina betyg
              </h3>
              <div className="space-y-3">
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
                      <Card className="p-3 border">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <Icon size={16} weight="duotone" className="text-primary" />
                            </div>
                            <Label className="font-heading font-semibold text-sm tracking-wide uppercase">
                              {category.label}
                            </Label>
                          </div>
                          <div>
                            <StarRating
                              value={categoryRating.rating}
                              onChange={(rating) => 
                                onUpdateRating(category.key as CategoryKey, rating, categoryRating.comment)
                              }
                              disabled={false}
                            />
                          </div>
                        </div>

                        {categoryRating.comment || focusedComment === category.key ? (
                          <div className="space-y-1.5 mt-3">
                            <Label htmlFor={`comment-${category.key}`} className="font-body text-xs text-muted-foreground">
                              Kommentar
                            </Label>
                            <Textarea
                              ref={(el) => {
                                textareaRefs.current[category.key] = el;
                              }}
                              id={`comment-${category.key}`}
                              value={categoryRating.comment}
                              onChange={(e) =>
                                onUpdateRating(category.key as CategoryKey, categoryRating.rating, e.target.value)
                              }
                              onFocus={() => setFocusedComment(category.key)}
                              onBlur={() => {
                                if (!categoryRating.comment) {
                                  setFocusedComment(null);
                                }
                              }}
                              placeholder="Skriv dina tankar här..."
                              className={`font-body resize-none text-sm transition-all duration-300 ease-in-out ${
                                focusedComment === category.key ? 'min-h-[120px]' : 'min-h-[60px]'
                              }`}
                              disabled={false}
                            />
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setFocusedComment(category.key)}
                            className="gap-2 text-muted-foreground hover:text-foreground font-body w-full justify-start -ml-2 mt-1 h-8"
                          >
                            <ChatCircleText size={16} weight="duotone" />
                            Lägg till kommentar
                          </Button>
                        )}
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
                        key={rating.profileId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Card className="p-6 border-2 border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
                                <span className="font-heading font-bold text-foreground">
                                  {rating.profileName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="font-heading font-semibold text-lg text-foreground">
                                  {rating.profileName}
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
