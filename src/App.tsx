import { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Entry, User, Profile, CategoryKey, UserRating, HEATS, CATEGORIES } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SignOut, ArrowLeft, Sparkle, Star, Trophy, Heart, Download, Globe, UserCircle } from '@phosphor-icons/react';
import { SSOLoginScreen } from '@/components/SSOLoginScreen';
import { ProfileSelector } from '@/components/ProfileSelector';
import { EntryCard } from '@/components/EntryCard';
import { RatingView } from '@/components/RatingView';
import { GlobalLeaderboard } from '@/components/GlobalLeaderboard';
import { PersonalLeaderboard } from '@/components/PersonalLeaderboard';
import { ExportRatingsDialog } from '@/components/ExportRatingsDialog';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import { MELODIFESTIVALEN_2026 } from '@/lib/melodifestivalen-data';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [users, setUsers] = useKV<User[]>('mello-users-v2', []);
  const [entries, setEntries] = useKV<Entry[]>('mello-entries-v2', []);
  const [dataVersion, setDataVersion] = useKV<number>('mello-data-version-v2', 0);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [selectedHeat, setSelectedHeat] = useState<string>(HEATS[0]);
  const [showGlobalLeaderboard, setShowGlobalLeaderboard] = useState(false);
  const [showPersonalLeaderboard, setShowPersonalLeaderboard] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  
  const CURRENT_DATA_VERSION = 3000;

  useEffect(() => {
    if ((entries || []).length === 0 || dataVersion !== CURRENT_DATA_VERSION) {
      initializeEntries();
      setDataVersion(CURRENT_DATA_VERSION);
      if (dataVersion !== CURRENT_DATA_VERSION && dataVersion !== 0) {
        toast.success('Data uppdaterad!', {
          description: 'Melodifestivalen 2026-bidrag har laddats',
        });
      }
    }
  }, []);

  const initializeEntries = () => {
    const initialEntries: Entry[] = MELODIFESTIVALEN_2026.map((entry) => ({
      id: `${entry.artist}-${entry.song}`.toLowerCase().replace(/\s+/g, '-'),
      number: entry.number,
      artist: entry.artist,
      song: entry.song,
      heat: entry.heat,
      heatDate: entry.heatDate,
      userRatings: [],
    }));
    setEntries(initialEntries);
  };

  const handleSSOLogin = async () => {
    try {
      const githubUser = await window.spark.user();
      
      if (!githubUser || !githubUser.email) {
        throw new Error('Kunde inte hämta GitHub-information');
      }
      
      const storedUsers = users || [];
      let foundUser = storedUsers.find((u) => u.email === githubUser.email);

      if (foundUser) {
        setCurrentUser(foundUser);
        toast.success('Välkommen tillbaka!', {
          description: `Inloggad som ${githubUser.login}`,
        });
      } else {
        const newUser: User = {
          id: `user-${Date.now()}`,
          email: githubUser.email,
          githubLogin: githubUser.login,
          avatarUrl: githubUser.avatarUrl,
          createdAt: Date.now(),
          profiles: [],
        };

        setUsers((current) => [...(current || []), newUser]);
        setCurrentUser(newUser);
        
        toast.success('Konto skapat!', {
          description: `Välkommen ${githubUser.login}`,
        });
      }
    } catch (error) {
      toast.error('Kunde inte logga in med GitHub', {
        description: 'Försök igen',
      });
      throw error;
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedProfile(null);
    toast.success('Utloggad');
  };

  const handleCreateProfile = (nickname: string) => {
    if (!currentUser) return;

    const newProfile: Profile = {
      id: `profile-${Date.now()}`,
      userId: currentUser.id,
      nickname,
      createdAt: Date.now(),
    };

    setUsers((current) => {
      const users = current || [];
      return users.map((u) =>
        u.id === currentUser.id
          ? { ...u, profiles: [...u.profiles, newProfile] }
          : u
      );
    });

    setCurrentUser((prev) => {
      if (!prev) return prev;
      return { ...prev, profiles: [...prev.profiles, newProfile] };
    });

    setSelectedProfile(newProfile);
    
    toast.success('Profil skapad!', {
      description: `${nickname} är redo`,
    });
  };

  const handleSelectProfile = (profile: Profile) => {
    setSelectedProfile(profile);
    toast.success('Profil vald', {
      description: profile.nickname,
    });
  };

  const handleBackToProfiles = () => {
    setSelectedProfile(null);
    setSelectedEntry(null);
  };

  const handleUpdateRating = (entryId: string, category: CategoryKey, rating: number, comment: string) => {
    if (!selectedProfile) return;

    setEntries((current) => {
      const entries = current || [];
      return entries.map((entry) => {
        if (entry.id === entryId) {
          const existingRating = entry.userRatings.find((ur) => ur.profileId === selectedProfile.id);
          
          let updatedUserRatings: UserRating[];
          
          if (existingRating) {
            const updatedRatings = {
              ...existingRating.ratings,
              [category]: { rating, comment },
            };
            
            const totalScore = Object.values(updatedRatings).reduce((sum, r) => sum + r.rating, 0);
            
            updatedUserRatings = entry.userRatings.map((ur) =>
              ur.profileId === selectedProfile.id
                ? { ...ur, ratings: updatedRatings, totalScore }
                : ur
            );
          } else {
            const newRatings = {
              song: { rating: 0, comment: '' },
              clothes: { rating: 0, comment: '' },
              scenography: { rating: 0, comment: '' },
              vocals: { rating: 0, comment: '' },
              lyrics: { rating: 0, comment: '' },
              postcard: { rating: 0, comment: '' },
              [category]: { rating, comment },
            };
            
            const totalScore = Object.values(newRatings).reduce((sum, r) => sum + r.rating, 0);
            
            updatedUserRatings = [
              ...entry.userRatings,
              {
                profileId: selectedProfile.id,
                profileName: selectedProfile.nickname,
                ratings: newRatings,
                totalScore,
              },
            ];
          }

          const updatedEntry = {
            ...entry,
            userRatings: updatedUserRatings,
          };

          if (selectedEntry?.id === entryId) {
            setSelectedEntry(updatedEntry);
          }

          return updatedEntry;
        }
        return entry;
      });
    });
  };

  const handleDeleteRating = (entryId: string) => {
    if (!selectedProfile) return;

    setEntries((current) => {
      const entries = current || [];
      return entries.map((entry) => {
        if (entry.id === entryId) {
          const updatedEntry = {
            ...entry,
            userRatings: entry.userRatings.filter((ur) => ur.profileId !== selectedProfile.id),
          };

          if (selectedEntry?.id === entryId) {
            setSelectedEntry(updatedEntry);
          }

          return updatedEntry;
        }
        return entry;
      });
    });

    toast.success('Betyg raderat');
  };

  const heatEntries = (entries || []).filter((e) => e.heat === selectedHeat).sort((a, b) => a.number - b.number);
  
  const getUserRating = (entry: Entry) => {
    return entry.userRatings.find((ur) => ur.profileId === selectedProfile?.id);
  };

  if (!currentUser) {
    return (
      <>
        <SSOLoginScreen onSSOLogin={handleSSOLogin} />
        <Toaster position="top-center" />
      </>
    );
  }

  if (!selectedProfile) {
    return (
      <>
        <ProfileSelector
          user={currentUser}
          onSelectProfile={handleSelectProfile}
          onCreateProfile={handleCreateProfile}
          onLogout={handleLogout}
        />
        <Toaster position="top-center" />
      </>
    );
  }

  if (selectedEntry) {
    const userRating = getUserRating(selectedEntry);

    return (
      <>
        <RatingView
          entry={selectedEntry}
          userRating={userRating}
          currentUserId={selectedProfile.id}
          onBack={() => setSelectedEntry(null)}
          onUpdateRating={(category, rating, comment) =>
            handleUpdateRating(selectedEntry.id, category, rating, comment)
          }
          onDeleteRating={() => handleDeleteRating(selectedEntry.id)}
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
              <div className="flex flex-col gap-4 mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="font-display text-4xl sm:text-5xl text-foreground mb-2 tracking-tight">
                      Melodifestivalen 2026
                    </h1>
                    <p className="font-body text-muted-foreground text-lg flex items-center gap-2">
                      <UserCircle size={20} weight="duotone" />
                      {selectedProfile.nickname}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {currentUser.avatarUrl ? (
                      <img 
                        src={currentUser.avatarUrl} 
                        alt={currentUser.githubLogin}
                        className="w-10 h-10 rounded-full border-2 border-border object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border-2 border-border">
                        <span className="font-heading font-bold text-foreground text-sm">
                          {currentUser.githubLogin.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="hidden sm:flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExportDialogOpen(true)}
                        className="gap-2 border-accent/30 hover:bg-accent/5"
                      >
                        <Download size={18} weight="duotone" />
                        Exportera
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBackToProfiles}
                        className="gap-2"
                      >
                        <ArrowLeft size={18} />
                        Profiler
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleLogout}
                        className="gap-2"
                      >
                        <SignOut size={18} />
                        Logga ut
                      </Button>
                    </div>
                    <div className="sm:hidden flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExportDialogOpen(true)}
                        className="gap-2"
                      >
                        <Download size={18} weight="duotone" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBackToProfiles}
                        className="gap-2"
                      >
                        <ArrowLeft size={18} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleLogout}
                        className="gap-2"
                      >
                        <SignOut size={18} />
                      </Button>
                    </div>
                  </div>
                </div>

                <Tabs value={selectedHeat} onValueChange={(value) => {
                  if (value === 'global') {
                    setShowPersonalLeaderboard(false);
                    setShowGlobalLeaderboard(true);
                  } else if (value === 'personal') {
                    setShowGlobalLeaderboard(false);
                    setShowPersonalLeaderboard(true);
                  } else {
                    setShowGlobalLeaderboard(false);
                    setShowPersonalLeaderboard(false);
                    setSelectedHeat(value);
                  }
                }} className="w-full">
                  <TabsList className="w-full grid grid-cols-3 sm:grid-cols-7 h-auto p-1 gap-1">
                    {HEATS.map((heat) => (
                      <TabsTrigger
                        key={heat}
                        value={heat}
                        className="font-body text-xs sm:text-sm md:text-base py-2.5 sm:py-3 px-2"
                      >
                        {heat}
                      </TabsTrigger>
                    ))}
                    <TabsTrigger
                      value="global"
                      className="font-body text-xs sm:text-sm md:text-base py-2.5 sm:py-3 px-2 gap-1.5"
                    >
                      <Globe size={16} weight="duotone" className="shrink-0" />
                      <span className="truncate">Alla</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="personal"
                      className="font-body text-xs sm:text-sm md:text-base py-2.5 sm:py-3 px-2 gap-1.5"
                    >
                      <Heart size={16} weight="duotone" className="shrink-0" />
                      <span className="truncate">Mina</span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </motion.div>

            {showGlobalLeaderboard ? (
              <div className="max-w-4xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="mb-6">
                    <h2 className="font-heading font-bold text-3xl text-foreground mb-2 flex items-center gap-3">
                      <Globe size={32} weight="duotone" className="text-accent" />
                      Global topplista
                    </h2>
                    <p className="font-body text-muted-foreground">
                      De bäst betygsatta bidragen från alla användare
                    </p>
                  </div>
                  <GlobalLeaderboard entries={entries || []} />
                </motion.div>
              </div>
            ) : showPersonalLeaderboard ? (
              <div className="max-w-4xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <h2 className="font-heading font-bold text-3xl text-foreground mb-2 flex items-center gap-3">
                        <Heart size={32} weight="duotone" className="text-accent" />
                        Mina favoriter
                      </h2>
                      <p className="font-body text-muted-foreground">
                        Dina bäst betygsatta bidrag
                      </p>
                    </div>
                    <Button
                      onClick={() => setExportDialogOpen(true)}
                      variant="outline"
                      className="gap-2 border-accent/30 hover:bg-accent/5"
                    >
                      <Download size={20} weight="duotone" />
                      Exportera
                    </Button>
                  </div>
                  <PersonalLeaderboard entries={entries || []} userId={selectedProfile.id} />
                </motion.div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence mode="popLayout">
                  {heatEntries.map((entry, index) => {
                    const userRating = getUserRating(entry);

                    return (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <EntryCard
                          entry={entry}
                          userRating={userRating}
                          onClick={() => setSelectedEntry(entry)}
                        />
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>

      <ExportRatingsDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        entries={entries || []}
        userId={selectedProfile.id}
        userName={selectedProfile.nickname}
      />

      <Toaster position="top-center" />
    </>
  );
}

export default App;
