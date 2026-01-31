import { Entry, User } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkle, Star, Trophy, Medal, Crown, LinkSimple, Users, Download } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { getMellopediaUrl } from '@/lib/melodifestivalen-data';
import { toast } from 'sonner';

interface GroupLeaderboardProps {
  entries: Entry[];
  users: User[];
}

export function GroupLeaderboard({ entries, users }: GroupLeaderboardProps) {
  const allProfiles = users.flatMap((user) =>
    user.profiles.map((profile) => ({
      ...profile,
      userGithubLogin: user.githubLogin,
    }))
  );

  const entriesWithGroupAverage = entries
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

  const handleExportImage = () => {
    if (entriesWithGroupAverage.length === 0) {
      toast.error('Ingen data att exportera');
      return;
    }

    try {
      toast.info('Skapar bild...', {
        description: 'Detta kan ta en stund',
      });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Kunde inte skapa canvas kontext');
      }

      const width = 1200;
      const height = Math.max(1200, 200 + entriesWithGroupAverage.length * 140);
      canvas.width = width;
      canvas.height = height;

      const colors = {
        background: '#f8f3f6',
        foreground: '#4a2d4a',
        primary: '#d45d7a',
        secondary: '#e8d98a',
        accent: '#89c6c5',
        gold: '#e8cd8c',
        muted: '#f2e5ef',
        mutedForeground: '#9e7c9e',
        border: '#e8c8dc',
      };

      ctx.fillStyle = colors.background;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = colors.primary;
      ctx.font = 'bold 48px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Melodifestivalen 2026', width / 2, 80);

      ctx.fillStyle = colors.mutedForeground;
      ctx.font = '24px sans-serif';
      ctx.fillText('Gruppens topplista', width / 2, 120);

      let y = 200;
      
      entriesWithGroupAverage.forEach((item, index) => {
        const cardX = 80;
        const cardY = y;
        const cardWidth = width - 160;
        const cardHeight = 120;

        ctx.fillStyle = colors.muted;
        ctx.strokeStyle = colors.border;
        ctx.lineWidth = 2;
        
        if (index === 0) {
          ctx.fillStyle = 'rgba(232, 205, 140, 0.2)';
          ctx.strokeStyle = 'rgba(232, 205, 140, 0.8)';
          ctx.lineWidth = 3;
        } else if (index === 1) {
          ctx.fillStyle = 'rgba(135, 206, 235, 0.15)';
          ctx.strokeStyle = 'rgba(135, 206, 235, 0.6)';
          ctx.lineWidth = 3;
        } else if (index === 2) {
          ctx.fillStyle = 'rgba(205, 127, 50, 0.15)';
          ctx.strokeStyle = 'rgba(205, 127, 50, 0.6)';
          ctx.lineWidth = 3;
        }
        
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, cardWidth, cardHeight, 12);
        ctx.fill();
        ctx.stroke();

        const posX = cardX + 60;
        const posY = cardY + cardHeight / 2 + 12;
        
        if (index === 0) {
          ctx.fillStyle = colors.gold;
          ctx.font = 'bold 36px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('👑', posX, posY);
        } else if (index === 1) {
          ctx.fillStyle = '#87CEEB';
          ctx.font = 'bold 36px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('🥈', posX, posY);
        } else if (index === 2) {
          ctx.fillStyle = '#CD7F32';
          ctx.font = 'bold 36px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('🥉', posX, posY);
        } else {
          ctx.fillStyle = colors.mutedForeground;
          ctx.font = 'bold 32px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText((index + 1).toString(), posX, posY);
        }

        const numberX = cardX + 140;
        const numberY = cardY + cardHeight / 2;
        
        ctx.fillStyle = colors.primary + '40';
        ctx.beginPath();
        ctx.roundRect(numberX - 25, numberY - 25, 50, 50, 8);
        ctx.fill();
        
        ctx.fillStyle = colors.foreground;
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(item.entry.number.toString(), numberX, numberY + 8);

        const textX = numberX + 60;
        const artistY = cardY + cardHeight / 2 - 15;
        const songY = cardY + cardHeight / 2 + 15;
        
        ctx.fillStyle = colors.mutedForeground;
        ctx.font = '600 16px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(item.entry.artist, textX, artistY);
        
        ctx.fillStyle = colors.foreground;
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText(item.entry.song, textX, songY);

        const scoreX = cardX + cardWidth - 120;
        const scoreY = cardY + cardHeight / 2 + 10;
        
        ctx.fillStyle = colors.gold;
        ctx.font = 'bold 36px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(item.average.toFixed(1), scoreX, scoreY);

        ctx.fillStyle = colors.mutedForeground;
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`${item.ratingsCount} betyg`, scoreX, scoreY + 20);

        y += 140;
      });

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = `melodifestivalen-2026-grupptopplista-${Date.now()}.png`;
          link.href = url;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          setTimeout(() => {
            URL.revokeObjectURL(url);
          }, 1000);
          
          toast.success('Grupptopplista exporterad!', {
            description: 'Bilden har laddats ner',
          });
        } else {
          throw new Error('Kunde inte skapa blob');
        }
      }, 'image/png', 1.0);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Kunde inte exportera bild', {
        description: error instanceof Error ? error.message : 'Försök igen',
      });
    }
  };

  if (entriesWithGroupAverage.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6">
          <Users size={48} weight="duotone" className="text-primary" />
        </div>
        <h2 className="font-heading font-bold text-2xl text-foreground mb-3 text-center">
          Ingen grupptopplista än
        </h2>
        <p className="font-body text-muted-foreground text-center max-w-md">
          Börja betygsätta bidragen för att se vilka som ligger i topp i gruppen
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="font-heading font-bold text-xl sm:text-2xl text-foreground mb-1">
            Gruppens topplista
          </h2>
          <p className="font-body text-muted-foreground text-xs sm:text-sm">
            Genomsnitt av alla {allProfiles.length} {allProfiles.length === 1 ? 'profil' : 'profiler'}
          </p>
        </div>
        <Button
          onClick={handleExportImage}
          variant="outline"
          className="gap-2 w-full sm:w-auto"
          size="sm"
        >
          <Download size={18} weight="duotone" />
          <span className="sm:inline">Exportera</span>
        </Button>
      </div>

      <div className="space-y-4">
        {entriesWithGroupAverage.map((item, index) => (
          <motion.div
            key={item.entry.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card
              className={`p-3 sm:p-6 border-2 relative overflow-hidden ${
                index === 0
                  ? ''
                  : index === 1
                  ? ''
                  : index === 2
                  ? ''
                  : 'border-border'
              }`}
              style={
                index === 0
                  ? {
                      background: 'linear-gradient(to bottom right, rgba(232, 205, 140, 0.1) 0%, rgba(232, 205, 140, 0.05) 50%, transparent 100%)',
                      borderColor: 'rgba(232, 205, 140, 0.5)',
                    }
                  : index === 1
                  ? {
                      background: 'linear-gradient(to bottom right, rgba(135, 206, 235, 0.05) 0%, transparent 100%)',
                      borderColor: 'rgba(135, 206, 235, 0.3)',
                    }
                  : index === 2
                  ? {
                      background: 'linear-gradient(to bottom right, rgba(205, 127, 50, 0.05) 0%, transparent 100%)',
                      borderColor: 'rgba(205, 127, 50, 0.3)',
                    }
                  : undefined
              }
            >
              <div className="flex items-center gap-3 sm:gap-6">
                <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 shrink-0">
                  {getPositionIcon(index)}
                </div>

                <div className="flex gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0">
                    <span className="font-heading font-bold text-foreground text-sm sm:text-base">
                      {item.entry.number}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <p className="text-muted-foreground font-body text-xs sm:text-sm font-semibold truncate">
                            {item.entry.artist}
                          </p>
                          <a
                            href={getMellopediaUrl(item.entry.artist)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80 transition-colors shrink-0"
                            title="Öppna artist på Mellopedia"
                          >
                            <LinkSimple size={14} weight="bold" className="sm:w-4 sm:h-4" />
                          </a>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-heading font-bold text-base sm:text-xl text-foreground truncate">
                            {item.entry.song}
                          </h3>
                          <a
                            href={getMellopediaUrl(item.entry.song)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80 transition-colors shrink-0"
                            title="Öppna på Mellopedia"
                          >
                            <LinkSimple size={16} weight="bold" className="sm:w-[18px] sm:h-[18px]" />
                          </a>
                        </div>
                      </div>
                      <Badge variant="secondary" className="shrink-0 font-body text-xs w-fit">
                        {item.entry.heat}
                      </Badge>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-3 pt-3 border-t border-border/50">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="flex shrink-0">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              weight={i < Math.round(item.average / 6) ? 'fill' : 'regular'}
                              className={
                                i < Math.round(item.average / 6)
                                  ? 'text-gold'
                                  : 'text-muted-foreground/40'
                              }
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground font-body truncate">
                          {item.ratingsCount} betyg
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Sparkle size={18} weight="fill" className="text-gold sm:w-5 sm:h-5" />
                        <span className="font-heading font-bold text-xl sm:text-2xl text-foreground">
                          {item.average.toFixed(1)}
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
    </div>
  );
}
