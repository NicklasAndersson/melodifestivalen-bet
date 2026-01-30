import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MusicNotes, SignIn, UserPlus } from '@phosphor-icons/react';
import { motion } from 'framer-motion';

interface LoginScreenProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (email: string, password: string, name: string) => Promise<void>;
}

export function LoginScreen({ onLogin, onRegister }: LoginScreenProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegistering) {
        await onRegister(email, password, name);
      } else {
        await onLogin(email, password);
      }
    } finally {
      setLoading(false);
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
              {isRegistering ? 'Skapa ett konto' : 'Logga in för att betygsätta'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <div className="space-y-2">
                <Label htmlFor="name" className="font-body">
                  Namn
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Ditt namn"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="font-body"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="font-body">
                E-post
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="din@email.se"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="font-body"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="font-body">
                Lösenord
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="font-body"
              />
              {isRegistering && (
                <p className="text-xs text-muted-foreground font-body">
                  Minst 6 tecken
                </p>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full font-heading gap-3 bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg"
              disabled={loading}
            >
              {isRegistering ? (
                <>
                  <UserPlus size={24} weight="bold" />
                  {loading ? 'Skapar konto...' : 'Skapa konto'}
                </>
              ) : (
                <>
                  <SignIn size={24} weight="bold" />
                  {loading ? 'Loggar in...' : 'Logga in'}
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="font-body text-sm text-primary hover:underline"
            >
              {isRegistering
                ? 'Har du redan ett konto? Logga in'
                : 'Har du inget konto? Registrera dig'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
