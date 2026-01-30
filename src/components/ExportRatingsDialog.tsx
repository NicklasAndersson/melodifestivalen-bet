import { useState, useRef } from 'react';
import { Entry } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Sparkle, Star, Crown, Medal, Download, Image as ImageIcon, FilePdf, MusicNotes, Palette, Television, Microphone, TextAa } from '@phosphor-icons/react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { CATEGORIES, CategoryKey } from '@/lib/types';

interface ExportRatingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entries: Entry[];
  userId: string;
  userName: string;
}

const iconMap = {
  MusicNotes,
  Palette,
  Television,
  Microphone,
  TextAa,
};

export function ExportRatingsDialog({ open, onOpenChange, entries, userId, userName }: ExportRatingsDialogProps) {
  const [isExporting, setIsExporting] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

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

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 0:
        return <Crown size={20} weight="fill" className="text-gold" />;
      case 1:
        return <Medal size={20} weight="fill" className="text-[oklch(0.7_0.1_200)]" />;
      case 2:
        return <Medal size={20} weight="fill" className="text-[oklch(0.6_0.12_30)]" />;
      default:
        return (
          <span className="font-heading font-bold text-lg text-muted-foreground">
            {position + 1}
          </span>
        );
    }
  };

  const exportAsImage = async () => {
    if (!exportRef.current) return;

    setIsExporting(true);
    try {
      const canvas = await html2canvas(exportRef.current, {
        scale: 2,
        backgroundColor: '#faf9fc',
        logging: false,
        useCORS: true,
        allowTaint: true,
      });

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((blob) => resolve(blob), 'image/png', 1.0);
      });

      if (!blob) {
        throw new Error('Failed to create image blob');
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `melodifestivalen-2026-${userName.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = url;
      link.click();
      
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 100);
      
      toast.success('Bild nedladdad!', {
        description: 'Din topplista har exporterats som bild',
      });
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Kunde inte exportera bild', {
        description: 'Försök igen eller använd PDF-export',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsPDF = async () => {
    if (!exportRef.current) return;

    setIsExporting(true);
    try {
      const canvas = await html2canvas(exportRef.current, {
        scale: 2,
        backgroundColor: '#faf9fc',
        logging: false,
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`melodifestivalen-2026-${userName.toLowerCase().replace(/\s+/g, '-')}.pdf`);

      toast.success('PDF nedladdad!', {
        description: 'Din topplista har exporterats som PDF',
      });
    } catch (error) {
      toast.error('Kunde inte exportera PDF', {
        description: 'Försök igen',
      });
    } finally {
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
            Ladda ner din topplista som bild eller PDF för att dela på sociala medier
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex gap-3">
            <Button
              onClick={exportAsImage}
              disabled={isExporting}
              className="flex-1 gap-2"
            >
              <ImageIcon size={20} weight="duotone" />
              {isExporting ? 'Exporterar...' : 'Ladda ner som bild'}
            </Button>
            <Button
              onClick={exportAsPDF}
              disabled={isExporting}
              variant="outline"
              className="flex-1 gap-2"
            >
              <FilePdf size={20} weight="duotone" />
              {isExporting ? 'Exporterar...' : 'Ladda ner som PDF'}
            </Button>
          </div>

          <div className="border-2 border-dashed border-border rounded-lg p-4 bg-muted/30">
            <p className="text-sm text-muted-foreground font-body text-center">
              Förhandsvisning av din export
            </p>
          </div>

          <div ref={exportRef} className="bg-background p-8 space-y-6">
            <div className="text-center space-y-2 pb-6 border-b-2 border-primary/20">
              <h1 className="font-display text-4xl text-foreground tracking-tight">
                Melodifestivalen 2026
              </h1>
              <p className="font-heading text-xl text-primary">
                {userName}s topplista
              </p>
              <p className="font-body text-sm text-muted-foreground">
                Mina {entriesWithUserRating.length} bäst betygsatta bidrag
              </p>
            </div>

            <div className="space-y-4">
              {entriesWithUserRating.map((item, index) => (
                <Card
                  key={item.entry.id}
                  className={`p-4 border-2 ${
                    index === 0
                      ? 'border-gold/50 bg-gradient-to-br from-gold/10 via-gold/5 to-transparent'
                      : index === 1
                      ? 'border-[oklch(0.7_0.1_200)]/30 bg-gradient-to-br from-[oklch(0.7_0.1_200)]/5 to-transparent'
                      : index === 2
                      ? 'border-[oklch(0.6_0.12_30)]/30 bg-gradient-to-br from-[oklch(0.6_0.12_30)]/5 to-transparent'
                      : 'border-border'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-12 h-12 shrink-0">
                      {getPositionIcon(index)}
                    </div>

                    <div className="flex-1 min-w-0 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-heading font-bold text-lg text-foreground">
                            {item.entry.song}
                          </h3>
                          <p className="text-muted-foreground font-body text-sm">
                            {item.entry.artist}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant="secondary" className="shrink-0 font-body text-xs">
                            {item.entry.heat}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Sparkle size={16} weight="fill" className="text-gold" />
                            <span className="font-heading font-bold text-xl text-foreground">
                              {item.rating.totalScore}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50">
                        {CATEGORIES.map((category) => {
                          const Icon = iconMap[category.icon as keyof typeof iconMap];
                          const categoryRating = item.rating.ratings[category.key as CategoryKey];
                          
                          return (
                            <div key={category.key} className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center shrink-0">
                                <Icon size={14} weight="duotone" className="text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <Label className="font-body text-[10px] uppercase tracking-wide text-muted-foreground">
                                  {category.label}
                                </Label>
                                <div className="flex gap-0.5 mt-0.5">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      size={10}
                                      weight={i < categoryRating.rating ? 'fill' : 'regular'}
                                      className={i < categoryRating.rating ? 'text-gold' : 'text-muted-foreground/30'}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {Object.values(item.rating.ratings).some(r => r.comment) && (
                        <div className="pt-2 border-t border-border/50">
                          <Label className="font-body text-xs text-muted-foreground mb-1 block">
                            Kommentarer:
                          </Label>
                          <div className="space-y-1">
                            {CATEGORIES.map((category) => {
                              const categoryRating = item.rating.ratings[category.key as CategoryKey];
                              if (!categoryRating.comment) return null;
                              
                              return (
                                <p key={category.key} className="text-xs text-foreground font-body">
                                  <span className="font-semibold">{category.label}:</span> {categoryRating.comment}
                                </p>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="text-center pt-6 border-t-2 border-primary/20">
              <p className="font-body text-xs text-muted-foreground">
                Skapad med Melodifestivalen 2026 Gruppbetyg
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
