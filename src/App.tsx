import { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Entry, Group, CategoryKey, UserRating, HEATS, CATEGORIES, User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, SignOut, ArrowLeft, Sparkle, Star, MusicNotes, Palette, Television, Microphone, TextAa, UsersThree, Trophy, Heart, LinkSimple, User as UserIcon, Download, Globe } from '@phosphor-icons/react';
import { LoginScreen } from '@/components/LoginScreen';
import { GroupSelection } from '@/components/GroupSelection';
import { EntryCard } from '@/components/EntryCard';
import { RatingView } from '@/components/RatingView';
import { MemberManagement } from '@/components/MemberManagement';
import { Leaderboard } from '@/components/Leaderboard';
import { GlobalLeaderboard } from '@/components/GlobalLeaderboard';
import { PersonalLeaderboard } from '@/components/PersonalLeaderboard';
import { SharedRatingsView } from '@/components/SharedRatingsView';
import { ExportRatingsDialog } from '@/components/ExportRatingsDialog';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import { MELODIFESTIVALEN_2026, getMellopediaUrl } from '@/lib/melodifestivalen-data';

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
  const [groups, setGroups] = useKV<Group[]>('mello-groups', []);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [entries, setEntries] = useKV<Entry[]>('mello-entries', []);
  const [dataVersion, setDataVersion] = useKV<number>('mello-data-version', 0);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [selectedHeat, setSelectedHeat] = useState<string>(HEATS[0]);
  const [viewOnlyGroupId, setViewOnlyGroupId] = useState<string | null>(null);
  const [viewOnlyUserId, setViewOnlyUserId] = useState<string | null>(null);
  const [memberManagementOpen, setMemberManagementOpen] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showGlobalLeaderboard, setShowGlobalLeaderboard] = useState(false);
  const [showPersonalLeaderboard, setShowPersonalLeaderboard] = useState(false);
  const [showGroupSelection, setShowGroupSelection] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  
  const CURRENT_DATA_VERSION = 2027;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const groupParam = params.get('group');
    const userParam = params.get('user');
    
    if (groupParam) {
      setViewOnlyGroupId(groupParam);
    }
    
    if (userParam) {
      setViewOnlyUserId(userParam);
    }
  }, []);



  useEffect(() => {
    if (viewOnlyGroupId && user) {
      handleJoinGroup(viewOnlyGroupId);
      setViewOnlyGroupId(null);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [user, viewOnlyGroupId]);

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
      number: entry.number,
      artist: entry.artist,
      song: entry.song,
      heat: entry.heat,
      heatDate: entry.heatDate,
      userRatings: [],
    }));
    setEntries(initialEntries);
  };

  const handleSelectExistingUser = (selectedUser: User) => {
    setUser({
      id: selectedUser.id,
      email: selectedUser.email,
      name: selectedUser.name,
      avatarUrl: selectedUser.avatarUrl,
    });
    toast.success('Välkommen tillbaka!', {
      description: `Inloggad som ${selectedUser.name}`,
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
    setSelectedGroupId(null);
    setShowGroupSelection(false);
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
    setShowGroupSelection(false);
  };

  const handleBackToGroups = () => {
    setSelectedGroupId(null);
    setSelectedEntry(null);
    setShowGroupSelection(true);
  };

  const handleBackToEntries = () => {
    setShowGroupSelection(false);
    setSelectedGroupId(null);
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

  const handleDeleteRating = (entryId: string) => {
    if (!user) return;

    setEntries((current) => {
      const entries = current || [];
      return entries.map((entry) => {
        if (entry.id === entryId) {
          const updatedEntry = {
            ...entry,
            userRatings: entry.userRatings.filter((ur) => ur.userId !== user.id),
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
  const heatEntries = (entries || []).filter((e) => e.heat === selectedHeat).sort((a, b) => a.number - b.number);
  
  const getUserRating = (entry: Entry) => {
    return entry.userRatings.find((ur) => ur.userId === user?.id);
  };

  const isViewOnly = !user && viewOnlyGroupId && selectedGroup;
  const isViewOnlyUser = !user && viewOnlyUserId;
  
  const viewOnlyUserData = isViewOnlyUser ? users?.find((u) => u.id === viewOnlyUserId) : null;

  if (!user && !viewOnlyGroupId && !viewOnlyUserId) {
    return (
      <>
        <LoginScreen 
          onSSOLogin={handleSSOLogin}
          existingUsers={users || []}
          onSelectUser={handleSelectExistingUser}
        />
        <Toaster position="top-center" />
      </>
    );
  }
  
  if (isViewOnlyUser && viewOnlyUserData) {
    return (
      <>
        <SharedRatingsView
          userName={viewOnlyUserData.name}
          userAvatar={viewOnlyUserData.avatarUrl}
          entries={entries || []}
          userId={viewOnlyUserId!}
        />
        <Toaster position="top-center" />
      </>
    );
  }
  
  if (isViewOnlyUser && !viewOnlyUserData) {
    return (
      <>
        <div className="min-h-screen bg-background flex items-center justify-center px-6">
          <div className="max-w-md text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-destructive/20 to-destructive/10 flex items-center justify-center mb-6 mx-auto">
              <UserIcon size={48} weight="duotone" className="text-destructive" />
            </div>
            <h2 className="font-heading font-bold text-3xl text-foreground mb-3">
              Användaren hittades inte
            </h2>
            <p className="font-body text-muted-foreground mb-6">
              Denna delningslänk är ogiltig eller användaren har tagit bort sitt konto.
            </p>
            <Button onClick={() => window.location.href = window.location.origin} className="gap-2">
              <ArrowLeft size={20} />
              Gå till startsidan
            </Button>
          </div>
        </div>
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
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="font-heading font-bold text-3xl text-foreground">
                        {selectedEntry.song}
                      </h2>
                      <a
                        href={getMellopediaUrl(selectedEntry.song)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 transition-colors"
                        title="Öppna på Mellopedia"
                      >
                        <LinkSimple size={24} weight="bold" />
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-muted-foreground font-body text-lg">
                        {selectedEntry.artist}
                      </p>
                      <a
                        href={getMellopediaUrl(selectedEntry.artist)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 transition-colors"
                        title="Öppna artist på Mellopedia"
                      >
                        <LinkSimple size={20} weight="bold" />
                      </a>
                    </div>
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
                    <TabsList className="w-full grid grid-cols-2 sm:grid-cols-4 h-auto p-1 gap-1">
                      {HEATS.map((heat) => (
                        <TabsTrigger
                          key={heat}
                          value={heat}
                          className="font-body text-xs sm:text-sm md:text-base py-2.5 sm:py-3 px-2"
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

  if (showGroupSelection) {
    return (
      <>
        <div className="min-h-screen bg-background">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <Button
              variant="ghost"
              onClick={handleBackToEntries}
              className="mb-6 font-body gap-2 -ml-2"
            >
              <ArrowLeft size={20} />
              Tillbaka till bidragen
            </Button>
            <GroupSelection
              user={user!}
              groups={groups || []}
              onCreateGroup={handleCreateGroup}
              onSelectGroup={handleSelectGroup}
              onJoinGroup={handleJoinGroup}
              onLogout={handleLogout}
            />
          </div>
        </div>
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
                      {selectedGroup ? selectedGroup.name : 'Melodifestivalen 2026'}
                    </h1>
                    {selectedGroup ? (
                      <p 
                        className="font-body text-muted-foreground text-lg cursor-pointer hover:text-foreground transition-colors flex items-center gap-2"
                        onClick={() => selectedGroup && selectedGroup.ownerId === user!.id && setMemberManagementOpen(true)}
                      >
                        <UsersThree size={20} weight="duotone" />
                        {selectedGroup?.memberIds.length} {selectedGroup?.memberIds.length === 1 ? 'medlem' : 'medlemmar'}
                      </p>
                    ) : (
                      <p className="font-body text-muted-foreground text-lg flex items-center gap-2">
                        <UserIcon size={20} weight="duotone" />
                        Mina betyg
                      </p>
                    )}
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
                        onClick={() => setExportDialogOpen(true)}
                        className="gap-2 border-accent/30 hover:bg-accent/5"
                      >
                        <Download size={18} weight="duotone" />
                        Exportera
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowGroupSelection(true)}
                        className="gap-2"
                      >
                        <Users size={18} />
                        {selectedGroup ? 'Byt grupp' : 'Grupper'}
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
                        onClick={() => setShowGroupSelection(true)}
                        className="gap-2"
                      >
                        <Users size={18} />
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
                  if (value === 'leaderboard') {
                    setShowLeaderboard(true);
                    setShowGlobalLeaderboard(false);
                    setShowPersonalLeaderboard(false);
                  } else if (value === 'global') {
                    setShowLeaderboard(false);
                    setShowPersonalLeaderboard(false);
                    setShowGlobalLeaderboard(true);
                  } else if (value === 'personal') {
                    setShowLeaderboard(false);
                    setShowGlobalLeaderboard(false);
                    setShowPersonalLeaderboard(true);
                  } else {
                    setShowLeaderboard(false);
                    setShowGlobalLeaderboard(false);
                    setShowPersonalLeaderboard(false);
                    setSelectedHeat(value);
                  }
                }} className="w-full">
                  <TabsList className={`w-full ${selectedGroup ? 'grid grid-cols-3 sm:grid-cols-7' : 'grid grid-cols-2 sm:grid-cols-6'} h-auto p-1 gap-1`}>
                    {HEATS.map((heat) => (
                      <TabsTrigger
                        key={heat}
                        value={heat}
                        className="font-body text-xs sm:text-sm md:text-base py-2.5 sm:py-3 px-2"
                      >
                        {heat}
                      </TabsTrigger>
                    ))}
                    {selectedGroup && (
                      <TabsTrigger
                        value="leaderboard"
                        className="font-body text-xs sm:text-sm md:text-base py-2.5 sm:py-3 px-2 gap-1.5"
                      >
                        <Trophy size={16} weight="duotone" className="shrink-0" />
                        <span className="truncate">Grupp</span>
                      </TabsTrigger>
                    )}
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

            {showLeaderboard && selectedGroup ? (
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
            ) : showGlobalLeaderboard ? (
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

      <ExportRatingsDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        entries={entries || []}
        userId={user!.id}
        userName={user!.name}
      />

      <Toaster position="top-center" />
    </>
  );
}

export default App;
