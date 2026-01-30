import { useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { Entry, CategoryKey } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Plus, MusicNotes, SortAscending, SortDescending } from '@phosphor-icons/react';
import { AddEntryDialog } from '@/components/AddEntryDialog';
import { EntryCard } from '@/components/EntryCard';
import { RatingView } from '@/components/RatingView';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'sonner';

function App() {
  const [entries, setEntries] = useKV<Entry[]>('melodifestivalen-entries', []);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sortDescending, setSortDescending] = useState(true);

  const handleAddEntry = (artist: string, song: string, heat: string) => {
    const newEntry: Entry = {
      id: Date.now().toString(),
      artist,
      song,
      heat,
      ratings: {
        song: { rating: 0, comment: '' },
        clothes: { rating: 0, comment: '' },
        scenography: { rating: 0, comment: '' },
        vocals: { rating: 0, comment: '' },
        lyrics: { rating: 0, comment: '' },
        postcard: { rating: 0, comment: '' },
      },
      totalScore: 0,
    };

    setEntries((current) => [...(current || []), newEntry]);
    toast.success('Bidrag tillagt!', {
      description: `${song} av ${artist}`,
    });
  };

  const handleUpdateRating = (entryId: string, category: CategoryKey, rating: number, comment: string) => {
    setEntries((current) =>
      (current || []).map((entry) => {
        if (entry.id === entryId) {
          const updatedRatings = {
            ...entry.ratings,
            [category]: { rating, comment },
          };
          const totalScore = Object.values(updatedRatings).reduce((sum, r) => sum + r.rating, 0);
          
          const updatedEntry = {
            ...entry,
            ratings: updatedRatings,
            totalScore,
          };

          if (selectedEntry?.id === entryId) {
            setSelectedEntry(updatedEntry);
          }

          return updatedEntry;
        }
        return entry;
      })
    );
  };

  const sortedEntries = [...(entries || [])].sort((a, b) => {
    if (sortDescending) {
      return b.totalScore - a.totalScore;
    }
    return a.totalScore - b.totalScore;
  });

  if (selectedEntry) {
    return (
      <>
        <RatingView
          entry={selectedEntry}
          onBack={() => setSelectedEntry(null)}
          onUpdateRating={(category, rating, comment) =>
            handleUpdateRating(selectedEntry.id, category, rating, comment)
          }
        />
        <Toaster position="top-center" />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,oklch(0.45_0.22_300/0.15),transparent_50%),radial-gradient(circle_at_bottom_left,oklch(0.65_0.25_350/0.15),transparent_50%)] pointer-events-none" />
          
          <div className="relative max-w-7xl mx-auto px-6 py-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h1 className="font-display text-4xl sm:text-5xl text-foreground mb-2 tracking-tight">
                    Melodifestivalen
                  </h1>
                  <p className="font-body text-muted-foreground text-lg">
                    Betygsätt alla bidrag
                  </p>
                </div>
                <Button
                  onClick={() => setDialogOpen(true)}
                  size="lg"
                  className="font-body gap-2 bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg"
                >
                  <Plus size={24} weight="bold" />
                  Lägg till bidrag
                </Button>
              </div>
            </motion.div>

            {(entries || []).length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="flex flex-col items-center justify-center py-20 px-6">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6">
                    <MusicNotes size={48} weight="duotone" className="text-primary" />
                  </div>
                  <h2 className="font-heading font-bold text-2xl text-foreground mb-3 text-center">
                    Inga bidrag än
                  </h2>
                  <p className="font-body text-muted-foreground text-center mb-6 max-w-md">
                    Börja med att lägga till dina första Melodifestivalen-bidrag för att börja betygsätta
                  </p>
                  <Button
                    onClick={() => setDialogOpen(true)}
                    size="lg"
                    className="font-body gap-2 bg-accent hover:bg-accent/90"
                  >
                    <Plus size={24} weight="bold" />
                    Lägg till första bidraget
                  </Button>
                </div>
              </motion.div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <p className="font-body text-muted-foreground">
                    {(entries || []).length} {(entries || []).length === 1 ? 'bidrag' : 'bidrag'}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSortDescending(!sortDescending)}
                    className="font-body gap-2"
                  >
                    {sortDescending ? (
                      <>
                        <SortDescending size={18} />
                        Högst först
                      </>
                    ) : (
                      <>
                        <SortAscending size={18} />
                        Lägst först
                      </>
                    )}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AnimatePresence mode="popLayout">
                    {sortedEntries.map((entry, index) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <EntryCard
                          entry={entry}
                          onClick={() => setSelectedEntry(entry)}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <AddEntryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onAdd={handleAddEntry}
      />

      <Toaster position="top-center" />
    </>
  );
}

export default App;