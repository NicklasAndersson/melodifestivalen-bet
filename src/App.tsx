import { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Entry, Group, CategoryKey, UserRating, HEATS } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, SignOut } from '@phosphor-icons/react';
import { LoginScreen } from '@/components/LoginScreen';
import { GroupSelection } from '@/components/GroupSelection';
import { EntryCard } from '@/components/EntryCard';
import { RatingView } from '@/components/RatingView';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import { MELODIFESTIVALEN_2025 } from '@/lib/melodifestivalen-data';

function App() {
  const [user, setUser] = useState<{ login: string; avatarUrl: string; id: string } | null>(null);
  const [groups, setGroups] = useKV<Group[]>('mello-groups', []);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [entries, setEntries] = useKV<Entry[]>('mello-entries', []);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [selectedHeat, setSelectedHeat] = useState<string>(HEATS[0]);

  useEffect(() => {
    const initUser = async () => {
      try {
        const userData = await window.spark.user();
        if (userData) {
          setUser({
            login: userData.login,
            avatarUrl: userData.avatarUrl,
            id: String(userData.id),
          });
        }
      } catch (error) {
        console.error('Failed to load user:', error);
      }
    };

    initUser();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const groupParam = params.get('group');
    if (groupParam && user) {
      handleJoinGroup(groupParam);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [user]);

  useEffect(() => {
    if ((entries || []).length === 0) {
      initializeEntries();
    }
  }, []);

  const initializeEntries = () => {
    const initialEntries: Entry[] = MELODIFESTIVALEN_2025.map((entry) => ({
      id: `${entry.artist}-${entry.song}`.toLowerCase().replace(/\s+/g, '-'),
      artist: entry.artist,
      song: entry.song,
      heat: entry.heat,
      userRatings: [],
    }));
    setEntries(initialEntries);
  };

  const handleLogin = async () => {
    try {
      const userData = await window.spark.user();
      if (userData) {
        setUser({
          login: userData.login,
          avatarUrl: userData.avatarUrl,
          id: String(userData.id),
        });
        toast.success('Välkommen!', {
          description: `Inloggad som ${userData.login}`,
        });
      }
    } catch (error) {
      toast.error('Kunde inte logga in', {
        description: 'Försök igen senare',
      });
    }
  };

  const handleLogout = () => {
    setUser(null);
    setSelectedGroupId(null);
    toast.success('Utloggad');
  };

  const handleCreateGroup = (name: string) => {
    if (!user) return;

    const newGroup: Group = {
      id: `group-${Date.now()}`,
      name,
      ownerId: user.id,
      ownerName: user.login,
      memberIds: [user.id],
      createdAt: Date.now(),
    };

    setGroups((current) => [...(current || []), newGroup]);
    setSelectedGroupId(newGroup.id);
    toast.success('Grupp skapad!', {
      description: `${name} är redo`,
    });
  };

  const handleJoinGroup = (groupId: string) => {
    if (!user) return;

    const extractedId = groupId.includes('?group=') 
      ? groupId.split('?group=')[1] 
      : groupId;

    setGroups((current) => {
      const groups = current || [];
      const group = groups.find((g) => g.id === extractedId);
      
      if (!group) {
        toast.error('Gruppen hittades inte');
        return groups;
      }

      if (group.memberIds.includes(user.id)) {
        setSelectedGroupId(extractedId);
        toast.info('Du är redan medlem');
        return groups;
      }

      return groups.map((g) =>
        g.id === extractedId
          ? { ...g, memberIds: [...g.memberIds, user.id] }
          : g
      );
    });

    setSelectedGroupId(extractedId);
    toast.success('Gick med i gruppen!');
  };

  const handleSelectGroup = (groupId: string) => {
    setSelectedGroupId(groupId);
  };

  const handleBackToGroups = () => {
    setSelectedGroupId(null);
    setSelectedEntry(null);
  };

  const handleUpdateRating = (entryId: string, category: CategoryKey, rating: number, comment: string) => {
    if (!user) return;

    setEntries((current) => {
      const entries = current || [];
      return entries.map((entry) => {
        if (entry.id === entryId) {
          const existingUserRating = entry.userRatings.find((ur) => ur.userId === user.id);
          
          let updatedUserRatings: UserRating[];
          
          if (existingUserRating) {
            const updatedRatings = {
              ...existingUserRating.ratings,
              [category]: { rating, comment },
            };
            
            const totalScore = Object.values(updatedRatings).reduce((sum, r) => sum + r.rating, 0);
            
            updatedUserRatings = entry.userRatings.map((ur) =>
              ur.userId === user.id
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
                userId: user.id,
                userName: user.login,
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

  const selectedGroup = (groups || []).find((g) => g.id === selectedGroupId);
  const heatEntries = (entries || []).filter((e) => e.heat === selectedHeat);
  
  const getUserRating = (entry: Entry) => {
    return entry.userRatings.find((ur) => ur.userId === user?.id);
  };

  if (!user) {
    return (
      <>
        <LoginScreen onLogin={handleLogin} />
        <Toaster position="top-center" />
      </>
    );
  }

  if (!selectedGroupId) {
    return (
      <>
        <GroupSelection
          user={user}
          groups={groups || []}
          onCreateGroup={handleCreateGroup}
          onSelectGroup={handleSelectGroup}
          onJoinGroup={handleJoinGroup}
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
          currentUserId={user.id}
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
              <div className="flex flex-col gap-4 mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="font-display text-4xl sm:text-5xl text-foreground mb-2 tracking-tight">
                      {selectedGroup?.name}
                    </h1>
                    <p className="font-body text-muted-foreground text-lg">
                      {selectedGroup?.memberIds.length} {selectedGroup?.memberIds.length === 1 ? 'medlem' : 'medlemmar'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatarUrl}
                      alt={user.login}
                      className="w-10 h-10 rounded-full border-2 border-border"
                    />
                    <div className="hidden sm:flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBackToGroups}
                        className="gap-2"
                      >
                        <Users size={18} />
                        Byt grupp
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
                  </div>
                </div>

                <Tabs value={selectedHeat} onValueChange={setSelectedHeat} className="w-full">
                  <TabsList className="w-full grid grid-cols-4 h-auto p-1">
                    {HEATS.map((heat) => (
                      <TabsTrigger
                        key={heat}
                        value={heat}
                        className="font-body text-sm sm:text-base py-3"
                      >
                        {heat}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>
            </motion.div>

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
          </div>
        </div>
      </div>

      <Toaster position="top-center" />
    </>
  );
}

export default App;
