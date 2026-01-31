import { Entry, CATEGORIES, HEATS, CategoryKey, UserRating } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, Sparkle, MusicNotes, Palette, Television, Microphone, TextAa, User, LinkSimple } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { getMellopediaUrl } from '@/lib/melodifestivalen-data';

const iconMap = {
  MusicNotes,
  Palette,
  Television,
  Microphone,
  TextAa,
};

interface SharedRatingsViewProps {
  userName: string;
  userAvatar?: string;
  entries: Entry[];
  userId: string;
}

export function SharedRatingsView({ userName, userAvatar, entries, userId }: SharedRatingsViewProps) {
  const [selectedHeat, setSelectedHeat] = useState<string>(HEATS[0]);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);

  const getUserRatings = (entry: Entry): UserRating | undefined => {
    return entry.userRatings.find((ur) => ur.profileId === userId);
  };

  const ratedEntries = entries.filter((entry) => {
    const rating = getUserRatings(entry);
    return rating && rating.totalScore > 0;
  });

  const heatEntries = ratedEntries.filter((e) => e.heat === selectedHeat);

  if (selectedEntry) {
    const userRating = getUserRatings(selectedEntry);

    if (!userRating) {
      setSelectedEntry(null);
      return null;
    }

    return (
      <div className="h-full flex flex-col">
        <div className="shrink-0 border-b border-border bg-card">
          <div className="max-w-4xl mx-auto px-6 py-6">
            <Button
              variant="ghost"
              onClick={() => setSelectedEntry(null)}
              className="mb-4 font-body gap-2 -ml-2"
            >
              <LinkSimple size={20} />
              Tillbaka
            </Button>
            
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0">
                  <span className="font-heading font-bold text-foreground text-2xl">
                    {selectedEntry.number}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="font-heading font-bold text-3xl text-foreground">
                      {selectedEntry.song}
                    </h2>
                    <a
                      href={getMellopediaUrl(selectedEntry.song)}
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
                      {selectedEntry.artist}
                    </p>
                    <a
                      href={getMellopediaUrl(selectedEntry.artist)}
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
                {selectedEntry.heat}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <Card className="p-6 border-2 border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  {userAvatar ? (
                    <img 
                      src={userAvatar} 
                      alt={userName}
                      className="w-12 h-12 rounded-full border-2 border-border object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
                      <span className="font-heading font-bold text-foreground text-lg">
                        {userName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-heading font-semibold text-xl text-foreground">
                      {userName}
                    </p>
                    <p className="text-sm text-muted-foreground font-body">
                      Totalt: {userRating.totalScore} / 30 poäng
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1.5">
                  <Sparkle size={28} weight="fill" className="text-gold" />
                  <span className="font-heading font-bold text-4xl text-foreground">
                    {userRating.totalScore}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {CATEGORIES.map((category) => {
                  const Icon = iconMap[category.icon as keyof typeof iconMap];
                  const categoryRating = userRating.ratings[category.key as CategoryKey];
                  
                  if (!categoryRating.rating && !categoryRating.comment) return null;

                  return (
                    <div key={category.key} className="border-t border-border/50 pt-4 first:border-t-0 first:pt-0">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Icon size={20} weight="duotone" className="text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <Label className="font-heading font-semibold text-base uppercase tracking-wide">
                              {category.label}
                            </Label>
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={18}
                                  weight={i < categoryRating.rating ? 'fill' : 'regular'}
                                  className={i < categoryRating.rating ? 'text-gold' : 'text-muted-foreground/30'}
                                />
                              ))}
                            </div>
                          </div>
                          {categoryRating.comment && (
                            <p className="text-sm text-muted-foreground font-body leading-relaxed">
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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsla(270,60%,35%,0.15),transparent_50%),radial-gradient(circle_at_bottom_left,hsla(330,70%,55%,0.15),transparent_50%)] pointer-events-none" />
        
        <div className="relative max-w-7xl mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col gap-4 mb-8">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  {userAvatar ? (
                    <img 
                      src={userAvatar} 
                      alt={userName}
                      className="w-16 h-16 rounded-full border-2 border-border object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center border-2 border-border">
                      <span className="font-heading font-bold text-foreground text-2xl">
                        {userName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <h1 className="font-display text-4xl sm:text-5xl text-foreground tracking-tight">
                      {userName}s betyg
                    </h1>
                    <p className="font-body text-muted-foreground text-lg mt-1 flex items-center gap-2">
                      <User size={20} weight="duotone" />
                      {ratedEntries.length} {ratedEntries.length === 1 ? 'bidrag betygsatt' : 'bidrag betygsatta'}
                    </p>
                  </div>
                </div>
              </div>

              <Tabs value={selectedHeat} onValueChange={setSelectedHeat} className="w-full">
                <TabsList className="w-full grid grid-cols-2 sm:grid-cols-4 h-auto p-1 gap-1">
                  {HEATS.map((heat) => (
                    <TabsTrigger
                      key={heat}
                      value={heat}
                      className="font-body text-xs sm:text-sm md:text-base py-2.5 sm:py-3 px-2"
                    >
                      {heat}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </motion.div>

          {heatEntries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {heatEntries.map((entry, index) => {
                  const userRating = getUserRatings(entry);
                  
                  if (!userRating) return null;

                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <motion.div
                        whileHover={{ y: -4, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card
                          className="p-6 cursor-pointer border-2 hover:border-primary/50 transition-colors relative overflow-hidden"
                          onClick={() => setSelectedEntry(entry)}
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
                                      weight={i < Math.round(userRating.totalScore / 6) ? 'fill' : 'regular'}
                                      className={i < Math.round(userRating.totalScore / 6) ? 'text-gold' : 'text-muted-foreground/40'}
                                    />
                                  ))}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-1.5">
                                <Sparkle size={20} weight="fill" className="text-gold" />
                                <span className="font-heading font-bold text-2xl text-foreground">
                                  {userRating.totalScore}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 px-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6">
                <Star size={48} weight="duotone" className="text-primary" />
              </div>
              <h2 className="font-heading font-bold text-2xl text-foreground mb-3 text-center">
                Inga betyg i denna deltävling
              </h2>
              <p className="font-body text-muted-foreground text-center max-w-md">
                {userName} har inte betygsatt några bidrag i {selectedHeat} än
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
