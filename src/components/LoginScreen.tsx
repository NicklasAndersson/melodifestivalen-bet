import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MusicNotes, GithubLogo } from '@phosphor-icons/react';
import { motion } from 'framer-motion';

interface LoginScreenProps {
  onSSOLogin: () => Promise<void>;
}

export function LoginScreen({ onSSOLogin }: LoginScreenProps) {
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
              Logga in för att betygsätta
            </p>
          </div>

          <Button
            type="button"
            size="lg"
            className="w-full font-heading gap-3 bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg"
            onClick={handleSSOLogin}
            disabled={ssoLoading}
          >
            <GithubLogo size={24} weight="fill" />
            {ssoLoading ? 'Loggar in...' : 'Fortsätt med GitHub'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
