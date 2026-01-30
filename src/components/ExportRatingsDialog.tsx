import { useState } from 'react';
import { Entry } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { CATEGORIES, CategoryKey } from '@/lib/types';

interface ExportRatingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entries: Entry[];
  userId: string;
  userName: string;
}

export function ExportRatingsDialog({ open, onOpenChange, entries, userId, userName }: ExportRatingsDialogProps) {
  const [isExporting, setIsExporting] = useState(false);

  const entriesWithUserRating = entries
    .map((entry) => {
      const userRating = entry.userRatings.find((ur) => ur.userId === userId);
      
      if (!userRating) {
        return null;
      }

      return { entry, rating: userRating };
    })
    .filter((item): item is { entry: Entry; rating: NonNullable<typeof item>['rating'] } => item !== null)
    .sort((a, b) => b.rating.totalScore - a.rating.totalScore)
    .slice(0, 10);

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

        ctx.font = 'bold 24px Quicksand, sans-serif';
        ctx.fillStyle = '#3a2d5c';
        ctx.fillText(item.entry.song, x + 90, y + 35);

        ctx.font = '18px Quicksand, sans-serif';
        ctx.fillStyle = '#7a6b98';
        ctx.fillText(item.entry.artist, x + 90, y + 62);

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
        
        categories.forEach((category, catIndex) => {
          const catX = x + 30 + (catIndex % 3) * categoryWidth;
          const catY = y + 100 + (Math.floor(catIndex / 3) * 35);
          
          const emojiMap: Record<string, string> = {
            MusicNotes: '🎵',
            Palette: '🎨',
            Television: '📺',
            Microphone: '🎤',
            TextAa: '📝',
          };
          
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
            <DialogTitle className="font-heading text-2xl">Exportera betyg</DialogTitle>
            <DialogDescription className="font-body">
              Du har inga betyg att exportera än. Börja betygsätta bidragen först!
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">Exportera dina betyg</DialogTitle>
          <DialogDescription className="font-body">
            Ladda ner din topplista som en bild
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex gap-3">
            <Button
              onClick={exportAsImage}
              disabled={isExporting}
              className="w-full gap-2"
            >
              <Download size={20} weight="duotone" />
              {isExporting ? 'Exporterar...' : 'Ladda ner som bild'}
            </Button>
          </div>

          <div className="border-2 border-dashed border-border rounded-lg p-8 bg-muted/30 text-center">
            <p className="text-sm text-muted-foreground font-body mb-2">
              Din topplista exporteras som en högkvalitativ PNG-bild
            </p>
            <p className="text-xs text-muted-foreground font-body">
              Perfekt för att dela på sociala medier eller spara för framtiden
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
