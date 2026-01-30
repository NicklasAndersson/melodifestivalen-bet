import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MusicNotes, GithubLogo, User as UserIcon } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '@/lib/types';

interface LoginScreenProps {
  onSSOLogin: () => Promise<void>;
  existingUsers: User[];
  onSelectUser: (user: User) => void;
}

export function LoginScreen({ onSSOLogin, existingUsers, onSelectUser }: LoginScreenProps) {
  const [ssoLoading, setSSOLoading] = useState(false);

  const handleSSOLogin = async () => {
    setSSOLoading(true);
    try {
      await onSSOLogin();
    } finally {
      setSSOLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,oklch(0.45_0.22_300/0.15),transparent_50%),radial-gradient(circle_at_bottom_left,oklch(0.65_0.25_350/0.15),transparent_50%)] pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative max-w-md w-full mx-6"
      >
        <div className="bg-card rounded-2xl shadow-2xl p-8 border-2 border-border">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6">
              <MusicNotes size={40} weight="duotone" className="text-primary" />
            </div>
            
            <h1 className="font-display text-4xl text-foreground mb-3 tracking-tight">
              Melodifestivalen
            </h1>
            
            <p className="font-body text-muted-foreground text-lg">
              Välj användare eller skapa ny
            </p>
          </div>

          <div className="space-y-4">
            {existingUsers.length > 0 && (
              <div className="space-y-3">
                <p className="font-heading text-sm text-muted-foreground text-center uppercase tracking-wide">
                  Befintliga användare
                </p>
                <AnimatePresence>
                  {existingUsers.map((user, index) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card
                        className="p-4 cursor-pointer border-2 hover:border-primary/50 transition-colors"
                        onClick={() => onSelectUser(user)}
                      >
                        <div className="flex items-center gap-3">
                          {user.avatarUrl ? (
                            <img 
                              src={user.avatarUrl} 
                              alt={user.name}
                              className="w-10 h-10 rounded-full border-2 border-border object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border-2 border-border">
                              <span className="font-heading font-bold text-foreground text-sm">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div className="flex-1 text-left">
                            <p className="font-heading font-semibold text-foreground">
                              {user.name}
                            </p>
                            <p className="text-xs text-muted-foreground font-body">
                              {user.email}
                            </p>
                          </div>
                          <UserIcon size={20} className="text-muted-foreground" />
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {existingUsers.length > 0 && (
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground font-body">eller</span>
                </div>
              </div>
            )}

            <Button
              type="button"
              size="lg"
              className="w-full font-heading gap-3 bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg"
              onClick={handleSSOLogin}
              disabled={ssoLoading}
            >
              <GithubLogo size={24} weight="fill" />
              {ssoLoading ? 'Loggar in...' : existingUsers.length > 0 ? 'Skapa ny användare med GitHub' : 'Fortsätt med GitHub'}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
