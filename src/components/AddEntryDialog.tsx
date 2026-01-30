import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from '@phosphor-icons/react';

interface AddEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (artist: string, song: string, heat: string) => void;
}

export function AddEntryDialog({ open, onOpenChange, onAdd }: AddEntryDialogProps) {
  const [artist, setArtist] = useState('');
  const [song, setSong] = useState('');
  const [heat, setHeat] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (artist.trim() && song.trim() && heat.trim()) {
      onAdd(artist.trim(), song.trim(), heat.trim());
      setArtist('');
      setSong('');
      setHeat('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">Lägg till bidrag</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="song" className="font-body font-medium text-sm">
              Låttitel
            </Label>
            <Input
              id="song"
              value={song}
              onChange={(e) => setSong(e.target.value)}
              placeholder="t.ex. Tattoo"
              className="font-body"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="artist" className="font-body font-medium text-sm">
              Artist
            </Label>
            <Input
              id="artist"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="t.ex. Loreen"
              className="font-body"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="heat" className="font-body font-medium text-sm">
              Deltävling
            </Label>
            <Input
              id="heat"
              value={heat}
              onChange={(e) => setHeat(e.target.value)}
              placeholder="t.ex. Deltävling 1, Final"
              className="font-body"
              required
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="font-body"
            >
              Avbryt
            </Button>
            <Button type="submit" className="font-body gap-2 bg-accent hover:bg-accent/90">
              <Plus size={20} weight="bold" />
              Lägg till
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
