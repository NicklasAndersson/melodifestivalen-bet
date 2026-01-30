import { useState } from 'react';
import { Group } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Plus, Copy, UserPlus, SignOut } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface GroupSelectionProps {
  user: { login: string; avatarUrl: string };
  groups: Group[];
  onCreateGroup: (name: string) => void;
  onSelectGroup: (groupId: string) => void;
  onJoinGroup: (groupId: string) => void;
  onLogout: () => void;
}

export function GroupSelection({
  user,
  groups,
  onCreateGroup,
  onSelectGroup,
  onJoinGroup,
  onLogout,
}: GroupSelectionProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupId, setGroupId] = useState('');

  const handleCreate = () => {
    if (groupName.trim()) {
      onCreateGroup(groupName.trim());
      setGroupName('');
      setCreateDialogOpen(false);
    }
  };

  const handleJoin = () => {
    if (groupId.trim()) {
      onJoinGroup(groupId.trim());
      setGroupId('');
      setJoinDialogOpen(false);
    }
  };

  const copyGroupLink = (groupId: string) => {
    const link = `${window.location.origin}?group=${groupId}`;
    navigator.clipboard.writeText(link);
    toast.success('Länk kopierad!', {
      description: 'Dela länken med dina vänner',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,oklch(0.45_0.22_300/0.15),transparent_50%),radial-gradient(circle_at_bottom_left,oklch(0.65_0.25_350/0.15),transparent_50%)] pointer-events-none" />
      
      <div className="relative max-w-5xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-4xl sm:text-5xl text-foreground mb-2 tracking-tight">
                Dina grupper
              </h1>
              <p className="font-body text-muted-foreground text-lg">
                Välj en grupp för att börja betygsätta
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={user.avatarUrl}
                  alt={user.login}
                  className="w-10 h-10 rounded-full border-2 border-border"
                />
                <span className="font-body text-foreground hidden sm:block">
                  {user.login}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
                className="gap-2"
              >
                <SignOut size={18} />
                Logga ut
              </Button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex gap-3 mb-8"
        >
          <Button
            onClick={() => setCreateDialogOpen(true)}
            size="lg"
            className="font-body gap-2 bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg"
          >
            <Plus size={24} weight="bold" />
            Skapa ny grupp
          </Button>
          <Button
            onClick={() => setJoinDialogOpen(true)}
            size="lg"
            variant="outline"
            className="font-body gap-2 border-2 border-primary/30 hover:bg-primary/5"
          >
            <UserPlus size={24} weight="bold" />
            Gå med i grupp
          </Button>
        </motion.div>

        {groups.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex flex-col items-center justify-center py-20 px-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6">
                <Users size={48} weight="duotone" className="text-primary" />
              </div>
              <h2 className="font-heading font-bold text-2xl text-foreground mb-3 text-center">
                Inga grupper än
              </h2>
              <p className="font-body text-muted-foreground text-center mb-6 max-w-md">
                Skapa en ny grupp eller gå med i en befintlig för att börja betygsätta tillsammans
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((group, index) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card
                  className="cursor-pointer hover:shadow-lg transition-all hover:border-primary/50"
                  onClick={() => onSelectGroup(group.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                        <Users size={24} weight="duotone" className="text-primary" />
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyGroupLink(group.id);
                        }}
                      >
                        <Copy size={18} />
                      </Button>
                    </div>
                    
                    <h3 className="font-heading font-bold text-xl text-foreground mb-2">
                      {group.name}
                    </h3>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-body text-muted-foreground">
                        {group.memberIds.length} {group.memberIds.length === 1 ? 'medlem' : 'medlemmar'}
                      </span>
                      <span className="font-body text-muted-foreground">
                        av {group.ownerName}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl">Skapa ny grupp</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="group-name" className="font-body">
                Gruppnamn
              </Label>
              <Input
                id="group-name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Mina vänner"
                className="font-body"
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              />
            </div>
            <Button
              onClick={handleCreate}
              className="w-full font-body gap-2 bg-accent hover:bg-accent/90"
              disabled={!groupName.trim()}
            >
              <Plus size={20} weight="bold" />
              Skapa grupp
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl">Gå med i grupp</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="group-id" className="font-body">
                Grupp-ID eller länk
              </Label>
              <Input
                id="group-id"
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                placeholder="Klistra in länk eller ID"
                className="font-body"
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              />
            </div>
            <Button
              onClick={handleJoin}
              className="w-full font-body gap-2 bg-accent hover:bg-accent/90"
              disabled={!groupId.trim()}
            >
              <UserPlus size={20} weight="bold" />
              Gå med
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
