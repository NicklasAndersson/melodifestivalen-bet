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
      return entries.map((entry) => {
          let updatedUserRatings: UserRating[];
          
  const handleBackToProfiles = () => {
    setSelectedProfile(null);
            
              ur.profileId === selectedProfile.id
                ? { ...ur, ratings: updatedRatings, totalScore }
              clothes: { rating: 0, comment: '' },
    if (!selectedProfile) return;
              vocals: { rating: 0, comment: '' },
              lyrics: { rating: 0, comment: '' },
              postcard: { rating: 0, comment: '' },
              [category]: { rating, comment },
            };
          const existingRating = entry.userRatings.find((ur) => ur.profileId === selectedProfile.id);
            const totalScore = Object.values(newRatings).reduce((sum, r) => sum + r.rating, 0);
            
            updatedUserRatings = [
          if (existingRating) {
              {
              ...existingRating.ratings,
                profileName: selectedProfile.nickname,
                ratings: newRatings,
                totalScore,
              },
            ];
          }
              ur.profileId === selectedProfile.id
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

                profileId: selectedProfile.id,
                profileName: selectedProfile.nickname,
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
    if (!selectedProfile) return;=== selectedProfile?.id);
  };

  if (!currentUser) {
    return (
      <>
        <SSOLoginScreen onSSOLogin={handleSSOLogin} />
        <Toaster position="top-center" />
            userRatings: entry.userRatings.filter((ur) => ur.profileId !== selectedProfile.id),
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
                      <UserCircle size={20} weight="duotone" />
                      {selectedProfile.nickname}
                    </p>
    return entry.userRatings.find((ur) => ur.profileId === selectedProfile?.id);
                  <div className="flex items-center gap-3">
                    {currentUser.avatarUrl ? (
  if (!currentUser) {
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border-2 border-border">
                        <span className="font-heading font-bold text-foreground text-sm">
        <SSOLoginScreen onSSOLogin={handleSSOLogin} />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExportDialogOpen(true)}
                      className="gap-2 border-accent/30 hover:bg-accent/5"
  if (!selectedProfile) {
                        <Download size={18} weight="duotone" />
                        Exportera
        <ProfileSelector
          user={currentUser}
          onSelectProfile={handleSelectProfile}
          onCreateProfile={handleCreateProfile}
          onLogout={handleLogout}
                        className="gap-2"
                      >
                        <ArrowLeft size={18} />
                        Profiler
                      </Button>
                    <Button
          currentUserId={selectedProfile.id}                      Melodifestivalen 2026                    <p className="font-body text-muted-foreground text-lg flex items-center gap-2">                      <UserCircle size={20} weight="duotone" />                      {selectedProfile.nickname}                    </p>                    {currentUser.avatarUrl ? (                        src={currentUser.avatarUrl}                         alt={currentUser.githubLogin}                          {currentUser.githubLogin.charAt(0).toUpperCase()}                        onClick={handleBackToProfiles}                        <ArrowLeft size={18} />                        Profiler                        onClick={handleBackToProfiles}                        <ArrowLeft size={18} />                  if (value === 'global') {                  <TabsList className="w-full grid grid-cols-3 sm:grid-cols-7 h-auto p-1 gap-1">            {showGlobalLeaderboard ? (                  <PersonalLeaderboard entries={entries || []} userId={selectedProfile.id} />        userId={selectedProfile.id}        userName={selectedProfile.nickname}