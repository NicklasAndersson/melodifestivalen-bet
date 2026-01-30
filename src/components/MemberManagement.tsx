import { useState } from 'react';
import { Group } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, UserPlus, X, Crown, User, Link, Copy } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface MemberManagementProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: Group;
  currentUserId: string;
  onAddMember: (userId: string) => void;
  onRemoveMember: (userId: string) => void;
}

export function MemberManagement({
  open,
  onOpenChange,
  group,
  currentUserId,
  onAddMember,
  onRemoveMember,
}: MemberManagementProps) {
  const [newMemberId, setNewMemberId] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const isOwner = group.ownerId === currentUserId;
  const shareUrl = `${window.location.origin}${window.location.pathname}?group=${group.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('Länk kopierad!', {
      description: 'Dela länken med andra för att bjuda in dem till gruppen',
    });
  };

  const handleAddMember = async () => {
    if (!newMemberId.trim()) return;
    
    setIsAdding(true);
    try {
      onAddMember(newMemberId.trim());
      setNewMemberId('');
      toast.success('Medlem tillagd!', {
        description: `${newMemberId.trim()} har lagts till i gruppen`,
      });
    } catch (error) {
      toast.error('Kunde inte lägga till medlem');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveMember = (userId: string, userName: string) => {
    if (userId === group.ownerId) {
      toast.error('Kan inte ta bort gruppens ägare');
      return;
    }
    
    onRemoveMember(userId);
    toast.success('Medlem borttagen', {
      description: `${userName} har tagits bort från gruppen`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl flex items-center gap-2">
            <Users size={28} weight="duotone" className="text-primary" />
            Medlemmar
          </DialogTitle>
          <DialogDescription className="font-body text-muted-foreground">
            {isOwner 
              ? 'Hantera medlemmar i din grupp. Du kan lägga till och ta bort medlemmar.'
              : 'Se vilka som är med i gruppen.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {isOwner && (
            <Card className="p-4 border-2 border-primary/30 bg-primary/5">
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Link size={20} weight="duotone" className="text-primary" />
                  <Label className="font-body font-semibold text-foreground">
                    Bjud in till gruppen
                  </Label>
                </div>
                <div className="flex gap-2">
                  <Input
                    value={shareUrl}
                    readOnly
                    className="font-body flex-1 text-sm bg-background"
                  />
                  <Button
                    onClick={handleCopyLink}
                    variant="secondary"
                    className="font-body gap-2 shrink-0"
                  >
                    <Copy size={20} weight="bold" />
                    Kopiera
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground font-body">
                  Dela länken så kan andra gå med i gruppen direkt
                </p>
              </div>
            </Card>
          )}

          {isOwner && (
            <Card className="p-4 border-2 border-accent/30 bg-accent/5">
              <div className="space-y-3">
                <Label htmlFor="new-member" className="font-body font-semibold text-foreground">
                  Lägg till medlem manuellt
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="new-member"
                    value={newMemberId}
                    onChange={(e) => setNewMemberId(e.target.value)}
                    placeholder="Ange GitHub användarnamn"
                    className="font-body flex-1"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
                  />
                  <Button
                    onClick={handleAddMember}
                    disabled={!newMemberId.trim() || isAdding}
                    className="font-body gap-2 shrink-0"
                  >
                    <UserPlus size={20} weight="bold" />
                    Lägg till
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground font-body">
                  Lägg till någon som redan har ett konto
                </p>
              </div>
            </Card>
          )}

          <div className="flex-1 min-h-0 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading font-semibold text-lg text-foreground">
                Medlemslista ({(group.members || []).length})
              </h3>
            </div>
            
            <ScrollArea className="h-[300px] -mx-2 px-2">
              <div className="space-y-2 pr-4">
                {(group.members || []).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center mb-4">
                      <Users size={32} weight="duotone" className="text-muted-foreground" />
                    </div>
                    <p className="font-body text-muted-foreground text-center text-sm">
                      Inga medlemmar i gruppen ännu
                    </p>
                  </div>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {(group.members || []).map((member, index) => {
                      const isGroupOwner = member.id === group.ownerId;
                      const isCurrentUser = member.id === currentUserId;
                      
                      return (
                        <motion.div
                          key={member.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.2, delay: index * 0.03 }}
                        >
                          <Card className="p-4 border-2 hover:border-primary/30 transition-colors">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0">
                                  {isGroupOwner ? (
                                    <Crown size={20} weight="fill" className="text-gold" />
                                  ) : (
                                    <User size={20} weight="duotone" className="text-primary" />
                                  )}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <p className="font-body font-semibold text-foreground truncate">
                                    {member.name}
                                    {isCurrentUser && (
                                      <span className="text-muted-foreground font-normal ml-2">(Du)</span>
                                    )}
                                  </p>
                                  {isGroupOwner && (
                                    <div className="flex items-center gap-1 mt-0.5">
                                      <Badge variant="secondary" className="font-body text-xs px-2 py-0">
                                        Gruppägare
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {isOwner && !isGroupOwner && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleRemoveMember(member.id, member.name)}
                                  className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                  <X size={20} weight="bold" />
                                </Button>
                              )}
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="font-body"
          >
            Stäng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
