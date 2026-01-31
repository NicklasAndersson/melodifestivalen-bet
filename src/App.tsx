import { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Entry, User, Profile, CategoryKey, UserRating, HEATS, CATEGORIES } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SignOut, ArrowLeft, Sparkle, Star, Trophy, Heart, Download, Globe, UserCircle, Users } from '@phosphor-icons/react';
import { SSOLoginScreen } from '@/components/SSOLoginScreen';
import { ProfileSelector } from '@/components/ProfileSelector';
import { EntryCard } from '@/components/EntryCard';
import { RatingView } from '@/components/RatingView';
import { ProfileComparisonView } from '@/components/ProfileComparisonView';
import { GlobalLeaderboard } from '@/components/GlobalLeaderboard';
import { PersonalLeaderboard } from '@/components/PersonalLeaderboard';
import { GroupLeaderboard } from '@/components/GroupLeaderboard';
import { ExportRatingsDialog } from '@/components/ExportRatingsDialog';
import { MigrationDebug } from '@/components/MigrationDebug';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import { MELODIFESTIVALEN_2026 } from '@/lib/melodifestivalen-data';
import { migrateEntries, validateEntries, getDataVersion } from '@/lib/migration';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [users, setUsers] = useKV<User[]>('mello-users-v2', []);
  const [entries, setEntries] = useKV<Entry[]>('mello-entries-v2', []);
  const [dataVersion, setDataVersion] = useKV<number>('mello-data-version-v2', 0);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [selectedHeat, setSelectedHeat] = useState<string>(HEATS[0]);
  const [showGlobalLeaderboard, setShowGlobalLeaderboard] = useState(false);
  const [showPersonalLeaderboard, setShowPersonalLeaderboard] = useState(false);
  const [showGroupLeaderboard, setShowGroupLeaderboard] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [showMigrationDebug, setShowMigrationDebug] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  
  const CURRENT_DATA_VERSION = getDataVersion();

  useEffect(() => {
    const currentEntries = entries || [];
    const needsMigration = currentEntries.length === 0 || dataVersion !== CURRENT_DATA_VERSION;
    
    if (needsMigration) {
      initializeEntries();
    }
  }, []);

  const initializeEntries = () => {
    const currentEntries = entries || [];
    
    if (currentEntries.length === 0) {
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
      setDataVersion(CURRENT_DATA_VERSION);
      return;
    }

    const { entries: migratedEntries, result } = migrateEntries(currentEntries);
    
    const validation = validateEntries(migratedEntries);
    if (!validation.valid) {
      console.error('Entry validation failed:', validation.errors);
      toast.error('Datavalidering misslyckades', {
        description: 'Vänligen kontakta support',
      });
      return;
    }
    
    setEntries(migratedEntries);
    setDataVersion(CURRENT_DATA_VERSION);
    
    if (result.totalRatings > 0) {
      if (result.migratedCount === result.totalRatings) {
        toast.success('Data uppdaterad!', {
          description: `Alla ${result.migratedCount} betyg migrerades`,
        });
      } else if (result.migratedCount > 0) {
        toast.warning('Delvis migrering', {
          description: `${result.migratedCount}/${result.totalRatings} betyg migrerades`,
        });
        
        if (result.unmatchedEntries.length > 0) {
          console.warn('Unmatched entries:', result.unmatchedEntries);
        }
      } else {
        toast.error('Migrering misslyckades', {
          description: 'Inga betyg kunde överföras',
        });
      }
    } else if (dataVersion !== 0) {
      toast.success('Data uppdaterad!', {
        description: 'Melodifestivalen 2026-bidrag har laddats',
      });
    }
  };

  const handleSSOLogin = async () => {
    try {
      const githubUser = await window.spark.user();
      
      if (!githubUser || !githubUser.email) {
        throw new Error('Kunde inte hämta GitHub-information');
      }
      
      setIsOwner(githubUser.isOwner);
      
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
    setShowComparison(false);
  };

  const handleRating = (entryId: string, category: CategoryKey, rating: number, comment: string) => {
    if (!selectedProfile) return;

    setEntries((currentEntries) => {
      return (currentEntries || []).map((entry) => {
        if (entry.id === entryId) {
          let updatedUserRatings: UserRating[];
          
          const existingRating = entry.userRatings.find((ur) => ur.profileId === selectedProfile.id);

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
              scenography: { rating: 0, comment: '' },
              clothes: { rating: 0, comment: '' },
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

    setEntries((currentEntries) => {
      return (currentEntries || []).map((entry) => {
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

  const handleImportRatings = (importedEntries: Entry[]) => {
    setEntries((currentEntries) => {
      const entriesMap = new Map((currentEntries || []).map(e => [e.id, e]));
      
      importedEntries.forEach(importedEntry => {
        entriesMap.set(importedEntry.id, importedEntry);
      });
      
      return Array.from(entriesMap.values());
    });
  };

  const heatEntries = (entries || []).filter((e) => e.heat === selectedHeat).sort((a, b) => a.number - b.number);
  
  const getUserRating = (entry: Entry) => {
    if (!selectedProfile) return undefined;
    return entry.userRatings.find((ur) => ur.profileId === selectedProfile.id);
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

  if (selectedEntry && showComparison) {
    return (
      <>
        <ProfileComparisonView
          entry={selectedEntry}
          currentUserId={selectedProfile.id}
          onBack={() => setShowComparison(false)}
        />
        <Toaster position="top-center" />
      </>
    );
  }

  if (selectedEntry) {
    return (
      <>
        <RatingView
          entry={selectedEntry}
          onBack={() => setSelectedEntry(null)}
          onUpdateRating={(category, rating, comment) => handleRating(selectedEntry.id, category, rating, comment)}
          userRating={getUserRating(selectedEntry)}
          currentUserId={selectedProfile.id}
          onDeleteRating={() => handleDeleteRating(selectedEntry.id)}
          onShowComparison={() => setShowComparison(true)}
        />
        <Toaster position="top-center" />
      </>
    );
  }

  if (showGlobalLeaderboard) {
    return (
      <>
        <div className="min-h-screen bg-background p-4 sm:p-6">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => setShowGlobalLeaderboard(false)}
                className="gap-2"
              >
                <ArrowLeft size={18} />
                Tillbaka
              </Button>
            </div>
            <GlobalLeaderboard entries={entries || []} />
          </div>
        </div>
        <Toaster position="top-center" />
      </>
    );
  }

  if (showPersonalLeaderboard) {
    return (
      <>
        <div className="min-h-screen bg-background p-4 sm:p-6">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => setShowPersonalLeaderboard(false)}
                className="gap-2"
              >
                <ArrowLeft size={18} />
                Tillbaka
              </Button>
            </div>
            <PersonalLeaderboard entries={entries || []} userId={selectedProfile.id} />
          </div>
        </div>
        <Toaster position="top-center" />
      </>
    );
  }

  if (showGroupLeaderboard) {
    return (
      <>
        <div className="min-h-screen bg-background p-4 sm:p-6">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => setShowGroupLeaderboard(false)}
                className="gap-2"
              >
                <ArrowLeft size={18} />
                Tillbaka
              </Button>
            </div>
            <GroupLeaderboard entries={entries || []} users={users || []} />
          </div>
        </div>
        <Toaster position="top-center" />
      </>
    );
  }

  if (showMigrationDebug && isOwner) {
    return (
      <>
        <MigrationDebug
          entries={entries || []}
          currentVersion={dataVersion || 0}
          onBack={() => setShowMigrationDebug(false)}
          onMigrate={(newEntries) => {
            setEntries(newEntries);
            setDataVersion(getDataVersion());
            setShowMigrationDebug(false);
            toast.success('Migration tillämpades', {
              description: 'Data har uppdaterats',
            });
          }}
        />
        <Toaster position="top-center" />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-1 flex items-center gap-2">
                  <Sparkle size={32} weight="duotone" className="text-primary" />
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
                    className="w-10 h-10 rounded-full border-2 border-border"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border-2 border-border">
                    <span className="font-heading font-bold text-foreground text-sm">
                      {currentUser.githubLogin.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExportDialogOpen(true)}
                    className="gap-2 border-accent/30 hover:bg-accent/5"
                  >
                    <Download size={18} weight="duotone" />
                    Backup
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
                </div>
              </div>
              {isOwner && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMigrationDebug(true)}
                  className="gap-2 text-xs opacity-50 hover:opacity-100"
                  title="Debug (endast ägare)"
                >
                  Debug
                </Button>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                variant={showGlobalLeaderboard ? 'default' : 'outline'}
                onClick={() => setShowGlobalLeaderboard(true)}
                className="gap-2 flex-1"
              >
                <Globe size={18} weight="duotone" />
                Global
              </Button>
              <Button
                variant={showGroupLeaderboard ? 'default' : 'outline'}
                onClick={() => setShowGroupLeaderboard(true)}
                className="gap-2 flex-1"
              >
                <Users size={18} weight="duotone" />
                Grupp
              </Button>
              <Button
                variant={showPersonalLeaderboard ? 'default' : 'outline'}
                onClick={() => setShowPersonalLeaderboard(true)}
                className="gap-2 flex-1"
              >
                <Trophy size={18} weight="duotone" />
                Min
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <Tabs value={selectedHeat} onValueChange={setSelectedHeat} className="w-full">
            <ScrollArea className="w-full pb-2">
              <TabsList className="w-full grid grid-cols-3 sm:grid-cols-7 h-auto p-1 gap-1">
                {HEATS.map((heat) => (
                  <TabsTrigger
                    key={heat}
                    value={heat}
                    className="text-xs sm:text-sm whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    {heat}
                  </TabsTrigger>
                ))}
              </TabsList>
            </ScrollArea>
          </Tabs>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {heatEntries.map((entry) => {
                const userRating = getUserRating(entry);
                return (
                  <motion.div
                    key={entry.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <EntryCard
                      entry={entry}
                      onClick={() => setSelectedEntry(entry)}
                      userRating={userRating}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <ExportRatingsDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        entries={entries || []}
        userId={selectedProfile.id}
        userName={selectedProfile.nickname}
        onImportRatings={handleImportRatings}
      />

      <Toaster position="top-center" />
    </>
  );
}

export default App;
