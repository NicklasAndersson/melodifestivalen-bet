import { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Entry, Group, CategoryKey, UserRating, HEATS, CATEGORIES, User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, SignOut, ArrowLeft, Sparkle, Star, MusicNotes, Palette, Television, Microphone, TextAa, UsersThree, Trophy, Heart } from '@phosphor-icons/react';
import { LoginScreen } from '@/components/LoginScreen';
import { GroupSelection } from '@/components/GroupSelection';
import { EntryCard } from '@/components/EntryCard';
import { RatingView } from '@/components/RatingView';
import { MemberManagement } from '@/components/MemberManagement';
import { Leaderboard } from '@/components/Leaderboard';
import { PersonalLeaderboard } from '@/components/PersonalLeaderboard';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import { MELODIFESTIVALEN_2026, isVotingAllowed } from '@/lib/melodifestivalen-data';

const iconMap = {
  MusicNotes,
  Palette,
  Television,
  Microphone,
  TextAa,
};

function App() {
  const [user, setUser] = useState<{ id: string; email: string; name: string; avatarUrl?: string } | null>(null);
  const [users, setUsers] = useKV<User[]>('mello-users', []);
  const [currentUserId, setCurrentUserId] = useKV<string | null>('mello-current-user', null);
  const [groups, setGroups] = useKV<Group[]>('mello-groups', []);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [entries, setEntries] = useKV<Entry[]>('mello-entries', []);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [selectedHeat, setSelectedHeat] = useState<string>(HEATS[0]);
  const [viewOnlyGroupId, setViewOnlyGroupId] = useState<string | null>(null);
  const [memberManagementOpen, setMemberManagementOpen] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showPersonalLeaderboard, setShowPersonalLeaderboard] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const groupParam = params.get('group');
    
    if (groupParam) {
      setViewOnlyGroupId(groupParam);
    }

    const loadCurrentUser = async () => {
      if (currentUserId) {
        const storedUsers = users || [];
        const foundUser = storedUsers.find((u) => u.id === currentUserId);
        if (foundUser) {
          setUser({
            id: foundUser.id,
            email: foundUser.email,
            name: foundUser.name,
            avatarUrl: foundUser.avatarUrl,
          });
        } else {
          setCurrentUserId(null);
        }
      }
    };

    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (viewOnlyGroupId && user) {
      handleJoinGroup(viewOnlyGroupId);
      setViewOnlyGroupId(null);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [user, viewOnlyGroupId]);

  useEffect(() => {
    if ((entries || []).length === 0) {
      initializeEntries();
    }
  }, []);

  useEffect(() => {
    setGroups((current) => {
      const groups = current || [];
      let needsUpdate = false;
      
      const updatedGroups = groups.map((group) => {
        if (!group.members || group.members.length === 0) {
          needsUpdate = true;
          return {
            ...group,
            members: group.memberIds.map((id) => ({
              id,
              name: id === group.ownerId ? group.ownerName : id,
            })),
          };
        }
        return group;
      });
      
      return needsUpdate ? updatedGroups : groups;
    });
  }, []);

  const initializeEntries = () => {
    const initialEntries: Entry[] = MELODIFESTIVALEN_2026.map((entry) => ({
      id: `${entry.artist}-${entry.song}`.toLowerCase().replace(/\s+/g, '-'),
      artist: entry.artist,
      song: entry.song,
      heat: entry.heat,
      heatDate: entry.heatDate,
      userRatings: [],
    }));
    setEntries(initialEntries);
  };

  const handleLogin = async (email: string, password: string) => {
    const storedUsers = users || [];
    const foundUser = storedUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (foundUser) {
      setUser({
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        avatarUrl: foundUser.avatarUrl,
      });
      setCurrentUserId(foundUser.id);
      toast.success('Välkommen!', {
        description: `Inloggad som ${foundUser.name}`,
      });
    } else {
      toast.error('Fel e-post eller lösenord', {
        description: 'Kontrollera dina uppgifter och försök igen',
      });
      throw new Error('Invalid credentials');
    }
  };

  const handleRegister = async (email: string, password: string, name: string) => {
    const storedUsers = users || [];
    
    if (storedUsers.find((u) => u.email === email)) {
      toast.error('E-posten är redan registrerad', {
        description: 'Använd en annan e-postadress eller logga in',
      });
      throw new Error('Email already exists');
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      password,
      name,
      authProvider: 'email',
      createdAt: Date.now(),
    };

    setUsers((current) => [...(current || []), newUser]);
    setUser({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
    });
    setCurrentUserId(newUser.id);
    
    toast.success('Konto skapat!', {
      description: `Välkommen ${name}`,
    });
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
        setUser({
          id: foundUser.id,
          email: foundUser.email,
          name: foundUser.name,
          avatarUrl: foundUser.avatarUrl,
        });
        setCurrentUserId(foundUser.id);
        toast.success('Välkommen tillbaka!', {
          description: `Inloggad som ${foundUser.name}`,
        });
      } else {
        const newUser: User = {
          id: `user-${Date.now()}`,
          email: githubUser.email,
          name: githubUser.login,
          authProvider: 'github',
          avatarUrl: githubUser.avatarUrl,
          createdAt: Date.now(),
        };

        setUsers((current) => [...(current || []), newUser]);
        setUser({
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          avatarUrl: newUser.avatarUrl,
        });
        setCurrentUserId(newUser.id);
        
        toast.success('Konto skapat!', {
          description: `Välkommen ${newUser.name}`,
        });
      }
    } catch (error) {
      toast.error('Kunde inte logga in med GitHub', {
        description: 'Försök igen eller använd e-post och lösenord',
      });
      throw error;
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentUserId(null);
    setSelectedGroupId(null);
    toast.success('Utloggad');
  };

  const handleCreateGroup = (name: string) => {
    if (!user) return;

    const newGroup: Group = {
      id: `group-${Date.now()}`,
      name,
      ownerId: user.id,
      ownerName: user.name,
      memberIds: [user.id],
      members: [{ id: user.id, name: user.name }],
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
          ? { 
              ...g, 
              memberIds: [...g.memberIds, user.id],
              members: [...(g.members || []), { id: user.id, name: user.name }]
            }
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
                userName: user.name,
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

  const handleAddMember = (memberId: string) => {
    if (!selectedGroupId) return;

    setGroups((current) => {
      const groups = current || [];
      return groups.map((g) => {
        if (g.id === selectedGroupId) {
          if (g.memberIds.includes(memberId)) {
            toast.info('Medlemmen finns redan i gruppen');
            return g;
          }
          return {
            ...g,
            memberIds: [...g.memberIds, memberId],
            members: [...(g.members || []), { id: memberId, name: memberId }],
          };
        }
        return g;
      });
    });
  };

  const handleRemoveMember = (memberId: string) => {
    if (!selectedGroupId) return;

    setGroups((current) => {
      const groups = current || [];
      return groups.map((g) => {
        if (g.id === selectedGroupId) {
          return {
            ...g,
            memberIds: g.memberIds.filter((id) => id !== memberId),
            members: (g.members || []).filter((m) => m.id !== memberId),
          };
        }
        return g;
      });
    });
  };

  const selectedGroup = (groups || []).find((g) => g.id === selectedGroupId) || (groups || []).find((g) => g.id === viewOnlyGroupId);
  const heatEntries = (entries || []).filter((e) => e.heat === selectedHeat);
  
  const getUserRating = (entry: Entry) => {
    return entry.userRatings.find((ur) => ur.userId === user?.id);
  };

  const isViewOnly = !user && viewOnlyGroupId && selectedGroup;

  if (!user && !viewOnlyGroupId) {
    return (
      <>
        <LoginScreen onLogin={handleLogin} onRegister={handleRegister} onSSOLogin={handleSSOLogin} />
        <Toaster position="top-center" />
      </>
    );
  }

  if (isViewOnly) {
    if (selectedEntry) {
      return (
        <>
          <div className="h-full flex flex-col">
            <div className="shrink-0 border-b border-border bg-card">
              <div className="max-w-4xl mx-auto px-6 py-6">
                <Button
                  variant="ghost"
                  onClick={() => setSelectedEntry(null)}
                  className="mb-4 font-body gap-2 -ml-2"
                >
                  <ArrowLeft size={20} />
                  Tillbaka
                </Button>
                
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-heading font-bold text-3xl text-foreground mb-2">
                      {selectedEntry.song}
                    </h2>
                    <p className="text-muted-foreground font-body text-lg">
                      {selectedEntry.artist}
                    </p>
                  </div>
                  <Badge variant="secondary" className="font-body text-base px-3 py-1.5">
                    {selectedEntry.heat}
                  </Badge>
                </div>

                <div className="mt-6 pt-6 border-t border-border">
                  <div className="bg-accent/10 border-2 border-accent/30 rounded-xl p-4">
                    <p className="font-body text-foreground text-center">
                      <span className="font-semibold">Logga in för att betygsätta</span> · Du kan se gruppens betyg nedan
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="max-w-4xl mx-auto px-6 py-8">
                {selectedEntry.userRatings.length > 0 ? (
                  <div>
                    <h3 className="font-heading font-bold text-2xl text-foreground mb-6 flex items-center gap-2">
                      <Users size={28} weight="duotone" className="text-accent" />
                      Gruppens betyg
                    </h3>
                    
                    <div className="space-y-6">
                      {selectedEntry.userRatings.map((rating, index) => (
                        <motion.div
                          key={rating.userId}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <Card className="p-6 border-2 border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
                            <div className="flex items-center justify-between mb-6">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
                                  <span className="font-heading font-bold text-foreground">
                                    {rating.userName.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-heading font-semibold text-lg text-foreground">
                                    {rating.userName}
                                  </p>
                                  <p className="text-xs text-muted-foreground font-body">
                                    Totalt: {rating.totalScore} / 30 poäng
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-1.5">
                                <Sparkle size={24} weight="fill" className="text-gold" />
                                <span className="font-heading font-bold text-3xl text-foreground">
                                  {rating.totalScore}
                                </span>
                              </div>
                            </div>

                            <div className="space-y-4">
                              {CATEGORIES.map((category) => {
                                const Icon = iconMap[category.icon as keyof typeof iconMap];
                                const categoryRating = rating.ratings[category.key as CategoryKey];
                                
                                if (!categoryRating.rating && !categoryRating.comment) return null;

                                return (
                                  <div key={category.key} className="border-t border-border/50 pt-4 first:border-t-0 first:pt-0">
                                    <div className="flex items-start gap-3">
                                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                        <Icon size={18} weight="duotone" className="text-primary" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-2">
                                          <Label className="font-heading font-semibold text-sm uppercase tracking-wide">
                                            {category.label}
                                          </Label>
                                          <div className="flex gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                              <Star
                                                key={i}
                                                size={16}
                                                weight={i < categoryRating.rating ? 'fill' : 'regular'}
                                                className={i < categoryRating.rating ? 'text-gold' : 'text-muted-foreground/30'}
                                              />
                                            ))}
                                          </div>
                                        </div>
                                        {categoryRating.comment && (
                                          <p className="text-sm text-muted-foreground font-body">
                                            {categoryRating.comment}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 px-6">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6">
                      <Users size={48} weight="duotone" className="text-primary" />
                    </div>
                    <h2 className="font-heading font-bold text-2xl text-foreground mb-3 text-center">
                      Inga betyg än
                    </h2>
                    <p className="font-body text-muted-foreground text-center mb-6 max-w-md">
                      Ingen har betygsatt det här bidraget än
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
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

              {showLeaderboard ? (
                <div className="max-w-4xl mx-auto">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="mb-6">
                      <h2 className="font-heading font-bold text-3xl text-foreground mb-2 flex items-center gap-3">
                        <Trophy size={32} weight="duotone" className="text-gold" />
                        Topplista
                      </h2>
                      <p className="font-body text-muted-foreground">
                        De bäst betygsatta bidragen i gruppen
                      </p>
                    </div>
                    <Leaderboard entries={entries || []} groupMemberIds={selectedGroup?.memberIds || []} />
                  </motion.div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AnimatePresence mode="popLayout">
                    {heatEntries.map((entry, index) => {
                      const groupAverage = entry.userRatings.length > 0
                        ? entry.userRatings.reduce((sum, ur) => sum + ur.totalScore, 0) / entry.userRatings.length
                        : 0;

                      return (
                        <motion.div
                          key={entry.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <motion.div
                            whileHover={{ y: -4, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Card
                              className="p-6 cursor-pointer border-2 hover:border-primary/50 transition-colors relative overflow-hidden"
                              onClick={() => setSelectedEntry(entry)}
                            >
                              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
                              
                              <div className="relative">
                                <div className="flex items-start justify-between gap-4 mb-3">
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-heading font-bold text-xl text-foreground mb-1 truncate">
                                      {entry.song}
                                    </h3>
                                    <p className="text-muted-foreground font-body text-sm truncate">
                                      {entry.artist}
                                    </p>
                                  </div>
                                  <Badge variant="secondary" className="shrink-0 font-body">
                                    {entry.heat}
                                  </Badge>
                                </div>

                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                                  <div className="flex items-center gap-2">
                                    <div className="flex">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          size={16}
                                          weight={i < Math.round(groupAverage / 6) ? 'fill' : 'regular'}
                                          className={i < Math.round(groupAverage / 6) ? 'text-gold' : 'text-muted-foreground/40'}
                                        />
                                      ))}
                                    </div>
                                    <span className="text-xs text-muted-foreground font-body">
                                      {entry.userRatings.length} {entry.userRatings.length === 1 ? 'betyg' : 'betyg'}
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center gap-1.5">
                                    <Sparkle size={20} weight="fill" className="text-gold" />
                                    <span className="font-heading font-bold text-2xl text-foreground">
                                      {groupAverage > 0 ? groupAverage.toFixed(1) : '0'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          </motion.div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>

        <Toaster position="top-center" />
      </>
    );
  }

  if (!selectedGroupId) {
    return (
      <>
        <GroupSelection
          user={user!}
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
          currentUserId={user!.id}
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
                    <p 
                      className="font-body text-muted-foreground text-lg cursor-pointer hover:text-foreground transition-colors flex items-center gap-2"
                      onClick={() => selectedGroup && selectedGroup.ownerId === user!.id && setMemberManagementOpen(true)}
                    >
                      <UsersThree size={20} weight="duotone" />
                      {selectedGroup?.memberIds.length} {selectedGroup?.memberIds.length === 1 ? 'medlem' : 'medlemmar'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {user!.avatarUrl ? (
                      <img 
                        src={user!.avatarUrl} 
                        alt={user!.name}
                        className="w-10 h-10 rounded-full border-2 border-border object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border-2 border-border">
                        <span className="font-heading font-bold text-foreground text-sm">
                          {user!.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="hidden sm:flex gap-2">
                      {selectedGroup && selectedGroup.ownerId === user!.id && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setMemberManagementOpen(true)}
                          className="gap-2 border-primary/30 hover:bg-primary/5"
                        >
                          <UsersThree size={18} weight="duotone" />
                          Hantera medlemmar
                        </Button>
                      )}
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

                <Tabs value={selectedHeat} onValueChange={(value) => {
                  if (value === 'leaderboard') {
                    setShowPersonalLeaderboard(false);
                    setShowLeaderboard(true);
                  } else if (value === 'personal') {
                    setShowLeaderboard(false);
                    setShowPersonalLeaderboard(true);
                  } else {
                    setShowLeaderboard(false);
                    setShowPersonalLeaderboard(false);
                    setSelectedHeat(value);
                  }
                }} className="w-full">
                  <TabsList className="w-full grid grid-cols-6 h-auto p-1">
                    {HEATS.map((heat) => (
                      <TabsTrigger
                        key={heat}
                        value={heat}
                        className="font-body text-sm sm:text-base py-3"
                      >
                        {heat}
                      </TabsTrigger>
                    ))}
                    <TabsTrigger
                      value="leaderboard"
                      className="font-body text-sm sm:text-base py-3 gap-2"
                    >
                      <Trophy size={18} weight="duotone" />
                      Grupp
                    </TabsTrigger>
                    <TabsTrigger
                      value="personal"
                      className="font-body text-sm sm:text-base py-3 gap-2"
                    >
                      <Heart size={18} weight="duotone" />
                      Mina
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </motion.div>

            {showLeaderboard ? (
              <div className="max-w-4xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="mb-6">
                    <h2 className="font-heading font-bold text-3xl text-foreground mb-2 flex items-center gap-3">
                      <Trophy size={32} weight="duotone" className="text-gold" />
                      Topplista
                    </h2>
                    <p className="font-body text-muted-foreground">
                      De bäst betygsatta bidragen i gruppen
                    </p>
                  </div>
                  <Leaderboard entries={entries || []} groupMemberIds={selectedGroup?.memberIds || []} />
                </motion.div>
              </div>
            ) : showPersonalLeaderboard ? (
              <div className="max-w-4xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="mb-6">
                    <h2 className="font-heading font-bold text-3xl text-foreground mb-2 flex items-center gap-3">
                      <Heart size={32} weight="duotone" className="text-accent" />
                      Mina favoriter
                    </h2>
                    <p className="font-body text-muted-foreground">
                      Dina bäst betygsatta bidrag
                    </p>
                  </div>
                  <PersonalLeaderboard entries={entries || []} userId={user!.id} />
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

      {selectedGroup && (
        <MemberManagement
          open={memberManagementOpen}
          onOpenChange={setMemberManagementOpen}
          group={selectedGroup}
          currentUserId={user!.id}
          onAddMember={handleAddMember}
          onRemoveMember={handleRemoveMember}
        />
      )}

      <Toaster position="top-center" />
    </>
  );
}

export default App;
