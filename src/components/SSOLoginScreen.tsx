import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GithubLogo, Sparkle } from '@phosphor-icons/react';
import { motion } from 'framer-motion';

interface SSOLoginScreenProps {
  onSSOLogin: () => Promise<void>;
}

export function SSOLoginScreen({ onSSOLogin }: SSOLoginScreenProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsla(270,60%,35%,0.15),transparent_50%),radial-gradient(circle_at_bottom_left,hsla(330,70%,55%,0.15),transparent_50%)] pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative max-w-md w-full"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 mb-6"
          >
            <Sparkle size={48} weight="duotone" className="text-primary" />
          </motion.div>
          
          <h1 className="font-display text-4xl sm:text-5xl text-foreground mb-3 tracking-tight">
            Melodifestivalen 2026
          </h1>
          <p className="font-body text-muted-foreground text-lg">
            Gruppbetyg
          </p>
        </div>

        <Card className="p-8 border-2">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="font-heading font-bold text-2xl text-foreground mb-2">
                Logga in
              </h2>
              <p className="font-body text-muted-foreground text-sm">
                Använd ditt GitHub-konto för att komma igång
              </p>
            </div>

            <Button
              onClick={onSSOLogin}
              size="lg"
              className="w-full gap-3 font-heading text-lg py-6"
            >
              <GithubLogo size={24} weight="fill" />
              Fortsätt med GitHub
            </Button>

            <div className="text-center pt-4">
              <p className="font-body text-xs text-muted-foreground">
                Efter inloggning kan du skapa flera profiler<br />
                med olika smeknamn för dina betyg
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
