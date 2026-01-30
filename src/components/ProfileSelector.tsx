import { useState } from 'react';
import { User, Profile } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, UserCircle, SignOut } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfileSelectorProps {
  user: User;
  onSelectProfile: (profile: Profile) => void;
  onCreateProfile: (nickname: string) => void;
  onLogout: () => void;
}

export function ProfileSelector({ user, onSelectProfile, onCreateProfile, onLogout }: ProfileSelectorProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [nickname, setNickname] = useState('');

  const handleCreateProfile = () => {
    if (nickname.trim()) {
      onCreateProfile(nickname.trim());
      setNickname('');
      setCreateDialogOpen(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,oklch(0.45_0.22_300/0.15),transparent_50%),radial-gradient(circle_at_bottom_left,oklch(0.65_0.25_350/0.15),transparent_50%)] pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative max-w-2xl w-full"
        >
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              {user.avatarUrl ? (
                <img 
                  src={user.avatarUrl} 
                  alt={user.githubLogin}
                  className="w-16 h-16 rounded-full border-2 border-border object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border-2 border-border">
                  <UserCircle size={40} weight="duotone" className="text-primary" />
                </div>
              )}
            </div>
            <h1 className="font-display text-4xl sm:text-5xl text-foreground mb-2 tracking-tight">
              Välj profil
            </h1>
            <p className="font-body text-muted-foreground text-lg">
              Inloggad som {user.githubLogin}
            </p>
          </div>

          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {user.profiles.map((profile, index) => (
                <motion.div
                  key={profile.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card
                    className="p-6 cursor-pointer border-2 hover:border-primary/50 transition-all hover:shadow-lg"
                    onClick={() => onSelectProfile(profile)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                        <span className="font-heading font-bold text-foreground text-xl">
                          {profile.nickname.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-heading font-bold text-xl text-foreground">
                          {profile.nickname}
                        </h3>
                        <p className="text-sm text-muted-foreground font-body">
                          Skapad {new Date(profile.createdAt).toLocaleDateString('sv-SE')}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: user.profiles.length * 0.1 }}
            >
              <Card
                className="p-6 cursor-pointer border-2 border-dashed border-primary/30 hover:border-primary/60 bg-primary/5 hover:bg-primary/10 transition-all"
                onClick={() => setCreateDialogOpen(true)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                    <Plus size={28} weight="bold" className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-xl text-foreground">
                      Skapa ny profil
                    </h3>
                    <p className="text-sm text-muted-foreground font-body">
                      Lägg till en profil med valfritt smeknamn
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          <div className="mt-8 text-center">
            <Button
              variant="ghost"
              onClick={onLogout}
              className="gap-2"
            >
              <SignOut size={20} />
              Logga ut
            </Button>
          </div>
        </motion.div>
      </div>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl">Skapa ny profil</DialogTitle>
            <DialogDescription className="font-body">
              Ge din profil ett smeknamn som identifierar den i betygsättningen
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nickname" className="font-heading">Smeknamn</Label>
              <Input
                id="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="t.ex. Mina betyg, Johans favoriter..."
                className="font-body"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateProfile();
                  }
                }}
                autoFocus
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setCreateDialogOpen(false);
                setNickname('');
              }}
              className="flex-1"
            >
              Avbryt
            </Button>
            <Button
              onClick={handleCreateProfile}
              disabled={!nickname.trim()}
              className="flex-1 gap-2"
            >
              <Plus size={20} />
              Skapa profil
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
