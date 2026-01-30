import { useState, useRef } from 'react';
import { Entry } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Image as ImageIcon, FilePdf } from '@phosphor-icons/react';
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

const iconEmojiMap: Record<string, string> = {
  MusicNotes: '🎵',
  Palette: '🎨',
  Television: '📺',
  Microphone: '🎤',
  TextAa: '📝',
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
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.querySelector('[data-export-content]');
          if (clonedElement instanceof HTMLElement) {
            clonedElement.style.backgroundColor = '#faf9fc';
          }
        }
      });

      canvas.toBlob((blob) => {
        if (!blob) {
          toast.error('Kunde inte skapa bildfil', {
            description: 'Försök igen eller använd PDF-export',
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
        description: 'Försök igen eller använd PDF-export',
      });
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
        allowTaint: true,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.querySelector('[data-export-content]');
          if (clonedElement instanceof HTMLElement) {
            clonedElement.style.backgroundColor = '#faf9fc';
          }
        }
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
      console.error('Export error:', error);
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
            Ladda ner din topplista som bild eller PDF
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

          <div ref={exportRef} data-export-content style={{ backgroundColor: '#faf9fc', padding: '32px' }}>
            <div style={{ 
              textAlign: 'center', 
              paddingBottom: '24px', 
              borderBottom: '2px solid rgba(206, 100, 173, 0.2)',
              marginBottom: '24px'
            }}>
              <h1 style={{ 
                fontFamily: 'Quicksand, sans-serif', 
                fontSize: '36px', 
                color: '#3a2d5c',
                fontWeight: 'bold',
                margin: '0 0 8px 0',
                letterSpacing: '-0.025em'
              }}>
                Melodifestivalen 2026
              </h1>
              <p style={{ 
                fontFamily: 'Quicksand, sans-serif', 
                fontSize: '20px', 
                color: '#ce64ad',
                fontWeight: '600',
                margin: '0 0 8px 0'
              }}>
                {userName}s topplista
              </p>
              <p style={{ 
                fontFamily: 'Quicksand, sans-serif', 
                fontSize: '14px', 
                color: '#7a6b98',
                margin: 0
              }}>
                Mina {entriesWithUserRating.length} bäst betygsatta bidrag
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {entriesWithUserRating.map((item, index) => {
                const borderColor = 
                  index === 0 ? 'rgba(220, 180, 100, 0.5)' :
                  index === 1 ? 'rgba(135, 206, 235, 0.3)' :
                  index === 2 ? 'rgba(205, 127, 50, 0.3)' :
                  '#d4c3e0';
                
                const bgGradient = 
                  index === 0 ? 'linear-gradient(135deg, rgba(220, 180, 100, 0.1) 0%, rgba(220, 180, 100, 0.05) 50%, transparent 100%)' :
                  index === 1 ? 'linear-gradient(135deg, rgba(135, 206, 235, 0.05) 0%, transparent 100%)' :
                  index === 2 ? 'linear-gradient(135deg, rgba(205, 127, 50, 0.05) 0%, transparent 100%)' :
                  '#ffffff';

                return (
                  <div
                    key={item.entry.id}
                    style={{
                      padding: '16px',
                      border: `2px solid ${borderColor}`,
                      borderRadius: '8px',
                      background: bgGradient,
                      backgroundColor: index > 2 ? '#ffffff' : undefined,
                    }}
                  >
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                      <div style={{ 
                        width: '48px', 
                        height: '48px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {index === 0 ? (
                          <span style={{ fontSize: '24px', color: '#dcb464' }}>👑</span>
                        ) : index === 1 ? (
                          <span style={{ fontSize: '24px', color: '#87CEEB' }}>🥈</span>
                        ) : index === 2 ? (
                          <span style={{ fontSize: '24px', color: '#CD7F32' }}>🥉</span>
                        ) : (
                          <span style={{ 
                            fontFamily: 'Quicksand, sans-serif', 
                            fontWeight: 'bold', 
                            fontSize: '18px', 
                            color: '#7a6b98' 
                          }}>
                            {index + 1}
                          </span>
                        )}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '12px' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <h3 style={{ 
                              fontFamily: 'Quicksand, sans-serif', 
                              fontWeight: 'bold', 
                              fontSize: '18px', 
                              color: '#3a2d5c',
                              margin: '0 0 4px 0'
                            }}>
                              {item.entry.song}
                            </h3>
                            <p style={{ 
                              fontFamily: 'Quicksand, sans-serif', 
                              fontSize: '14px', 
                              color: '#7a6b98',
                              margin: 0
                            }}>
                              {item.entry.artist}
                            </p>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                            <span style={{
                              fontFamily: 'Quicksand, sans-serif',
                              fontSize: '12px',
                              padding: '4px 8px',
                              backgroundColor: '#e8dff1',
                              color: '#3a2d5c',
                              borderRadius: '4px',
                              fontWeight: '500'
                            }}>
                              {item.entry.heat}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{ fontSize: '16px', color: '#dcb464' }}>✨</span>
                              <span style={{ 
                                fontFamily: 'Quicksand, sans-serif', 
                                fontWeight: 'bold', 
                                fontSize: '20px', 
                                color: '#3a2d5c' 
                              }}>
                                {item.rating.totalScore}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: '1fr 1fr', 
                          gap: '8px', 
                          paddingTop: '8px', 
                          borderTop: '1px solid rgba(212, 195, 224, 0.5)' 
                        }}>
                          {CATEGORIES.map((category) => {
                            const emoji = iconEmojiMap[category.icon];
                            const categoryRating = item.rating.ratings[category.key as CategoryKey];
                            
                            return (
                              <div key={category.key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ 
                                  width: '24px', 
                                  height: '24px', 
                                  borderRadius: '4px', 
                                  backgroundColor: 'rgba(206, 100, 173, 0.1)', 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center',
                                  flexShrink: 0
                                }}>
                                  <span style={{ fontSize: '12px' }}>{emoji}</span>
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ 
                                    fontFamily: 'Quicksand, sans-serif', 
                                    fontSize: '10px', 
                                    textTransform: 'uppercase', 
                                    letterSpacing: '0.05em', 
                                    color: '#7a6b98',
                                    marginBottom: '2px'
                                  }}>
                                    {category.label}
                                  </div>
                                  <div style={{ display: 'flex', gap: '2px', marginTop: '2px' }}>
                                    {[...Array(5)].map((_, i) => (
                                      <span
                                        key={i}
                                        style={{ 
                                          fontSize: '10px',
                                          color: i < categoryRating.rating ? '#dcb464' : 'rgba(122, 107, 152, 0.3)',
                                          lineHeight: 1
                                        }}
                                      >
                                        ★
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {Object.values(item.rating.ratings).some(r => r.comment) && (
                          <div style={{ 
                            paddingTop: '8px', 
                            borderTop: '1px solid rgba(212, 195, 224, 0.5)',
                            marginTop: '8px'
                          }}>
                            <div style={{ 
                              fontFamily: 'Quicksand, sans-serif', 
                              fontSize: '12px', 
                              color: '#7a6b98',
                              marginBottom: '4px',
                              fontWeight: '600'
                            }}>
                              Kommentarer:
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              {CATEGORIES.map((category) => {
                                const categoryRating = item.rating.ratings[category.key as CategoryKey];
                                if (!categoryRating.comment) return null;
                                
                                return (
                                  <p key={category.key} style={{ 
                                    fontFamily: 'Quicksand, sans-serif', 
                                    fontSize: '12px', 
                                    color: '#3a2d5c',
                                    margin: 0
                                  }}>
                                    <span style={{ fontWeight: '600' }}>{category.label}:</span> {categoryRating.comment}
                                  </p>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ 
              textAlign: 'center', 
              paddingTop: '24px', 
              borderTop: '2px solid rgba(206, 100, 173, 0.2)' 
            }}>
              <p style={{ 
                fontFamily: 'Quicksand, sans-serif', 
                fontSize: '12px', 
                color: '#7a6b98',
                margin: 0
              }}>
                Skapad med Melodifestivalen 2026 Gruppbetyg
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
