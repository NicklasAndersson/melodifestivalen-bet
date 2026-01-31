import { useState, useRef } from 'react';
import { Entry, User } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Upload, FileJs, Image } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { CATEGORIES, CategoryKey } from '@/lib/types';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface ExportRatingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entries: Entry[];
  userId: string;
  userName: string;
  currentUser: User;
  onImportRatings?: (importedEntries: Entry[]) => void;
}

export function ExportRatingsDialog({ open, onOpenChange, entries, userId, userName, currentUser, onImportRatings }: ExportRatingsDialogProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const exportAsJSON = () => {
    try {
      const profileIds = currentUser.profiles.map(p => p.id);
      
      const backupData = {
        version: 2,
        exportDate: new Date().toISOString(),
        accountId: currentUser.id,
        accountEmail: currentUser.email,
        githubLogin: currentUser.githubLogin,
        profiles: currentUser.profiles.map(p => ({
          id: p.id,
          nickname: p.nickname,
          createdAt: p.createdAt,
        })),
        entries: entries.map(entry => ({
          id: entry.id,
          number: entry.number,
          artist: entry.artist,
          song: entry.song,
          heat: entry.heat,
          heatDate: entry.heatDate,
          userRatings: entry.userRatings.filter(ur => profileIds.includes(ur.profileId))
        })).filter(entry => entry.userRatings.length > 0)
      };

      const jsonString = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().split('T')[0];
      link.download = `melodifestivalen-2026-backup-${currentUser.githubLogin.toLowerCase().replace(/\s+/g, '-')}-${timestamp}.json`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
      
      const totalRatings = backupData.entries.reduce((sum, e) => sum + e.userRatings.length, 0);
      
      toast.success('Backup nedladdad!', {
        description: `${currentUser.profiles.length} profil(er) och ${totalRatings} betyg exporterade`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Kunde inte exportera betyg', {
        description: 'Försök igen',
      });
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);

    try {
      const text = await file.text();
      const backupData = JSON.parse(text);

      if (!backupData.version || !backupData.entries || !Array.isArray(backupData.entries)) {
        throw new Error('Ogiltigt backup-format');
      }

      if (backupData.version === 2 && backupData.accountId && backupData.profiles) {
        if (backupData.accountId !== currentUser.id) {
          const confirmed = confirm(
            `Denna backup är från kontot "${backupData.githubLogin || backupData.accountEmail}".\n\n` +
            `Du importerar till kontot "${currentUser.githubLogin}".\n\n` +
            `Backupen innehåller ${backupData.profiles.length} profil(er).\n\n` +
            'Vill du fortsätta? Detta kommer skriva över befintliga betyg för dessa bidrag.'
          );
          
          if (!confirmed) {
            setIsImporting(false);
            return;
          }
        }

        const importedEntries = backupData.entries.map((backupEntry: any) => {
          const existingEntry = entries.find(e => e.id === backupEntry.id);
          
          if (!existingEntry) {
            return null;
          }

          const profileIdMapping = new Map<string, string>();
          backupData.profiles.forEach((backupProfile: any) => {
            const matchingProfile = currentUser.profiles.find(p => 
              p.nickname === backupProfile.nickname || p.id === backupProfile.id
            );
            if (matchingProfile) {
              profileIdMapping.set(backupProfile.id, matchingProfile.id);
            }
          });

          const allProfileIds = currentUser.profiles.map(p => p.id);
          const otherUserRatings = existingEntry.userRatings.filter(
            ur => !allProfileIds.includes(ur.profileId)
          );

          const importedUserRatings = backupEntry.userRatings
            .map((ur: any) => {
              const newProfileId = profileIdMapping.get(ur.profileId) || ur.profileId;
              const matchingProfile = currentUser.profiles.find(p => p.id === newProfileId);
              
              if (!matchingProfile) {
                return null;
              }

              return {
                ...ur,
                profileId: newProfileId,
                profileName: matchingProfile.nickname
              };
            })
            .filter((ur: any) => ur !== null);

          return {
            ...existingEntry,
            userRatings: [...otherUserRatings, ...importedUserRatings]
          };
        }).filter((entry): entry is Entry => entry !== null);

        if (importedEntries.length === 0) {
          throw new Error('Inga betyg kunde importeras');
        }

        if (onImportRatings) {
          onImportRatings(importedEntries);
        }

        const totalImportedRatings = importedEntries.reduce(
          (sum, e) => sum + e.userRatings.filter(ur => 
            currentUser.profiles.some(p => p.id === ur.profileId)
          ).length, 
          0
        );

        toast.success('Betyg importerade!', {
          description: `${importedEntries.length} bidrag och ${totalImportedRatings} betyg återställda`,
        });

        onOpenChange(false);
      } else if (backupData.version === 1 || backupData.profileId) {
        const confirmed = confirm(
          `Detta är en gammal backup (version 1) från en enskild profil "${backupData.profileName || 'okänd'}".\n\n` +
          `Vilken profil vill du importera till?\n\n` +
          `Aktuell profil: "${userName}"`
        );
        
        if (!confirmed) {
          setIsImporting(false);
          return;
        }

        const importedEntries = backupData.entries.map((backupEntry: any) => {
          const existingEntry = entries.find(e => e.id === backupEntry.id);
          
          if (!existingEntry) {
            return null;
          }

          const otherUserRatings = existingEntry.userRatings.filter(ur => ur.profileId !== userId);
          const importedUserRatings = backupEntry.userRatings.map((ur: any) => ({
            ...ur,
            profileId: userId,
            profileName: userName
          }));

          return {
            ...existingEntry,
            userRatings: [...otherUserRatings, ...importedUserRatings]
          };
        }).filter((entry): entry is Entry => entry !== null);

        if (importedEntries.length === 0) {
          throw new Error('Inga betyg kunde importeras');
        }

        if (onImportRatings) {
          onImportRatings(importedEntries);
        }

        toast.success('Betyg importerade!', {
          description: `${importedEntries.length} bidrag har återställts`,
        });

        onOpenChange(false);
      } else {
        throw new Error('Okänt backup-format');
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Kunde inte importera betyg', {
        description: error instanceof Error ? error.message : 'Kontrollera att filen är korrekt',
      });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const exportAsImage = async () => {
    setIsExporting(true);
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      const width = 1200;
      const itemHeight = 180;
      const headerHeight = 180;
      const footerHeight = 80;
      const padding = 40;
      const itemSpacing = 20;
      
      const height = headerHeight + (entriesWithUserRating.length * (itemHeight + itemSpacing)) + footerHeight;
      
      canvas.width = width;
      canvas.height = height;

      ctx.fillStyle = '#faf9fc';
      ctx.fillRect(0, 0, width, height);

      ctx.font = 'bold 48px Quicksand, sans-serif';
      ctx.fillStyle = '#3a2d5c';
      ctx.textAlign = 'center';
      ctx.fillText('Melodifestivalen 2026', width / 2, 70);

      ctx.font = '600 28px Quicksand, sans-serif';
      ctx.fillStyle = '#ce64ad';
      ctx.fillText(`${userName}s topplista`, width / 2, 115);

      ctx.font = '18px Quicksand, sans-serif';
      ctx.fillStyle = '#7a6b98';
      ctx.fillText(`Mina ${entriesWithUserRating.length} bäst betygsatta bidrag`, width / 2, 150);

      let yOffset = headerHeight;

      entriesWithUserRating.forEach((item, index) => {
        const x = padding;
        const y = yOffset;
        const cardWidth = width - (padding * 2);

        ctx.save();
        
        if (index === 0) {
          ctx.fillStyle = 'rgba(220, 180, 100, 0.1)';
          ctx.strokeStyle = 'rgba(220, 180, 100, 0.5)';
        } else if (index === 1) {
          ctx.fillStyle = 'rgba(135, 206, 235, 0.08)';
          ctx.strokeStyle = 'rgba(135, 206, 235, 0.3)';
        } else if (index === 2) {
          ctx.fillStyle = 'rgba(205, 127, 50, 0.08)';
          ctx.strokeStyle = 'rgba(205, 127, 50, 0.3)';
        } else {
          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = '#d4c3e0';
        }
        
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(x, y, cardWidth, itemHeight, 12);
        ctx.fill();
        ctx.stroke();

        ctx.font = '32px sans-serif';
        ctx.textAlign = 'left';
        if (index === 0) {
          ctx.fillText('👑', x + 20, y + 45);
        } else if (index === 1) {
          ctx.fillText('🥈', x + 20, y + 45);
        } else if (index === 2) {
          ctx.fillText('🥉', x + 20, y + 45);
        } else {
          ctx.font = 'bold 24px Quicksand, sans-serif';
          ctx.fillStyle = '#7a6b98';
          ctx.fillText(`${index + 1}`, x + 30, y + 40);
        }

        ctx.font = 'bold 18px Quicksand, sans-serif';
        ctx.fillStyle = '#7a6b98';
        ctx.fillText(`#${item.entry.number}`, x + 90, y + 28);

        ctx.font = 'bold 24px Quicksand, sans-serif';
        ctx.fillStyle = '#3a2d5c';
        ctx.fillText(item.entry.song, x + 90, y + 55);

        ctx.font = '18px Quicksand, sans-serif';
        ctx.fillStyle = '#7a6b98';
        ctx.fillText(item.entry.artist, x + 90, y + 82);

        ctx.font = '500 14px Quicksand, sans-serif';
        ctx.fillStyle = '#3a2d5c';
        const heatWidth = ctx.measureText(item.entry.heat).width;
        ctx.fillStyle = '#e8dff1';
        ctx.beginPath();
        ctx.roundRect(cardWidth - heatWidth - 35, y + 15, heatWidth + 20, 26, 6);
        ctx.fill();
        ctx.fillStyle = '#3a2d5c';
        ctx.fillText(item.entry.heat, cardWidth - heatWidth - 25, y + 33);

        ctx.font = '24px sans-serif';
        ctx.fillText('✨', cardWidth - 20, y + 70);
        ctx.font = 'bold 28px Quicksand, sans-serif';
        ctx.fillStyle = '#3a2d5c';
        ctx.textAlign = 'right';
        ctx.fillText(String(item.rating.totalScore), cardWidth - 35, y + 70);

        ctx.strokeStyle = 'rgba(212, 195, 224, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + 20, y + 85);
        ctx.lineTo(x + cardWidth - 20, y + 85);
        ctx.stroke();

        const categories = CATEGORIES;
        const categoryWidth = (cardWidth - 60) / 3;
        
        const emojiMap: Record<string, string> = {
          MusicNotes: '🎵',
          Palette: '🎨',
          Television: '📺',
          Microphone: '🎤',
          TextAa: '📝',
        };
        
        categories.forEach((category, catIndex) => {
          const catX = x + 30 + (catIndex % 3) * categoryWidth;
          const catY = y + 95 + Math.floor(catIndex / 3) * 40;
          
          const emoji = emojiMap[category.icon];
          
          ctx.fillStyle = 'rgba(206, 100, 173, 0.1)';
          ctx.beginPath();
          ctx.roundRect(catX, catY, 28, 28, 6);
          ctx.fill();
          
          ctx.font = '16px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(emoji, catX + 14, catY + 20);

          ctx.font = '500 12px Quicksand, sans-serif';
          ctx.fillStyle = '#7a6b98';
          ctx.textAlign = 'left';
          ctx.fillText(category.label, catX + 38, catY + 12);

          const categoryRating = item.rating.ratings[category.key as CategoryKey];
          const stars = '★'.repeat(categoryRating.rating) + '☆'.repeat(5 - categoryRating.rating);
          ctx.font = '14px sans-serif';
          ctx.fillStyle = '#dcb464';
          ctx.fillText(stars.substring(0, categoryRating.rating), catX + 38, catY + 26);
          ctx.fillStyle = 'rgba(122, 107, 152, 0.3)';
          ctx.fillText(stars.substring(categoryRating.rating), catX + 38 + (categoryRating.rating * 9), catY + 26);
        });

        ctx.restore();
        yOffset += itemHeight + itemSpacing;
      });

      ctx.strokeStyle = 'rgba(206, 100, 173, 0.2)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(padding, height - footerHeight + 20);
      ctx.lineTo(width - padding, height - footerHeight + 20);
      ctx.stroke();

      ctx.font = '16px Quicksand, sans-serif';
      ctx.fillStyle = '#7a6b98';
      ctx.textAlign = 'center';
      ctx.fillText('Skapad med Melodifestivalen 2026 Gruppbetyg', width / 2, height - 35);

      canvas.toBlob((blob) => {
        if (!blob) {
          toast.error('Kunde inte skapa bildfil', {
            description: 'Försök igen',
          });
          setIsExporting(false);
          return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `melodifestivalen-2026-${userName.toLowerCase().replace(/\s+/g, '-')}.png`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 1000);
        
        toast.success('Bild nedladdad!', {
          description: 'Din topplista har exporterats som bild',
        });
        setIsExporting(false);
      }, 'image/png', 1.0);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Kunde inte exportera bild', {
        description: 'Försök igen',
      });
      setIsExporting(false);
    }
  };

  if (entriesWithUserRating.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl">Säkerhetskopiera betyg</DialogTitle>
            <DialogDescription className="font-body">
              Du har inga betyg att exportera än. Men du kan importera en tidigare säkerhetskopia om du har en!
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
            
            <Button
              onClick={handleImportClick}
              disabled={isImporting}
              variant="outline"
              className="w-full gap-2"
            >
              <Upload size={20} weight="duotone" />
              {isImporting ? 'Importerar...' : 'Importera backup'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">Säkerhetskopiera & Återställ</DialogTitle>
          <DialogDescription className="font-body">
            Exportera dina betyg som backup eller dela din topplista
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="backup" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="backup">Säkerhetskopiera</TabsTrigger>
            <TabsTrigger value="share">Dela topplista</TabsTrigger>
          </TabsList>

          <TabsContent value="backup" className="space-y-6 mt-6">
            <div className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-6 bg-muted/30">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <FileJs size={24} weight="duotone" className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading font-semibold text-lg mb-1">Exportera betyg</h3>
                    <p className="text-sm text-muted-foreground font-body mb-4">
                      Ladda ner alla betyg för alla dina profiler ({currentUser.profiles.length} st) som en JSON-fil. Använd denna för att återställa alla dina profilers betyg senare eller flytta dem till en annan enhet.
                    </p>
                    <Button
                      onClick={exportAsJSON}
                      className="w-full gap-2"
                    >
                      <Download size={20} weight="duotone" />
                      Exportera alla betyg (JSON)
                    </Button>
                  </div>
                </div>
              </div>

              <div className="border-2 border-dashed border-border rounded-lg p-6 bg-muted/30">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-accent/10">
                    <Upload size={24} weight="duotone" className="text-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading font-semibold text-lg mb-1">Importera betyg</h3>
                    <p className="text-sm text-muted-foreground font-body mb-4">
                      Återställ alla dina profilers betyg från en tidigare backup. Detta kommer matcha profiler baserat på smeknamn och återställa alla betyg.
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleFileImport}
                      className="hidden"
                    />
                    <Button
                      onClick={handleImportClick}
                      disabled={isImporting}
                      variant="outline"
                      className="w-full gap-2"
                    >
                      <Upload size={20} weight="duotone" />
                      {isImporting ? 'Importerar...' : 'Välj backup-fil'}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-xs text-blue-900 dark:text-blue-100 font-body">
                  <strong>Tips:</strong> Exportera dina betyg regelbundet för att säkerställa att du inte förlorar dem. 
                  Backup-filer kan användas för att återställa betyg även om du byter enhet eller webbläsare.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="share" className="space-y-6 mt-6">
            <div className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-6 bg-muted/30">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Image size={24} weight="duotone" className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading font-semibold text-lg mb-1">Dela som bild</h3>
                    <p className="text-sm text-muted-foreground font-body mb-4">
                      Ladda ner din topplista som en vacker bild perfekt för sociala medier. Visar dina topp 10 betygsatta bidrag.
                    </p>
                    <Button
                      onClick={exportAsImage}
                      disabled={isExporting}
                      className="w-full gap-2"
                    >
                      <Download size={20} weight="duotone" />
                      {isExporting ? 'Skapar bild...' : 'Ladda ner som bild'}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <p className="text-xs text-purple-900 dark:text-purple-100 font-body">
                  Bilden innehåller dina topp 10 bidrag med alla betyg och är optimerad för delning!
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
