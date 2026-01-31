import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CloudArrowUp, X, Database, Download } from '@phosphor-icons/react';
import { getAutoBackup, clearAutoBackup, getTotalRatingsCount } from '@/lib/backup';
import { Entry, User } from '@/lib/types';

interface DataRecoveryBannerProps {
  currentEntries: Entry[];
  currentUsers: User[];
  onRestore: (entries: Entry[], users: User[]) => void;
  onExportBackup: () => void;
}

export function DataRecoveryBanner({ 
  currentEntries, 
  currentUsers,
  onRestore,
  onExportBackup
}: DataRecoveryBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [backup, setBackup] = useState<Awaited<ReturnType<typeof getAutoBackup>> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBackup = async () => {
      const data = await getAutoBackup();
      setBackup(data);
      setLoading(false);
    };
    loadBackup();
  }, []);
  
  if (loading || dismissed || !backup) return null;
  
  const currentRatingsCount = getTotalRatingsCount(currentEntries);
  const backupRatingsCount = getTotalRatingsCount(backup.entries);
  
  if (backupRatingsCount === 0) return null;
  
  const hasDataLoss = backupRatingsCount > currentRatingsCount;
  
  if (!hasDataLoss) return null;

  const handleRestore = () => {
    const confirmRestore = confirm(
      `Automatiskt backup hittat med ${backupRatingsCount} betyg!\n\n` +
      `Du har för närvarande ${currentRatingsCount} betyg.\n\n` +
      `Vill du återställa backupen? Detta kommer skriva över dina nuvarande data.`
    );
    
    if (confirmRestore) {
      onRestore(backup.entries, backup.users);
      setDismissed(true);
    }
  };

  const handleDownloadBackup = () => {
    try {
      const backupData = {
        version: backup.version,
        exportDate: new Date(backup.timestamp).toISOString(),
        type: 'full-backup',
        entries: backup.entries,
        users: backup.users,
      };

      const jsonString = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().split('T')[0];
      link.download = `melodifestivalen-2026-recovery-${timestamp}.json`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
    } catch (error) {
      console.error('Failed to download backup:', error);
    }
  };

  const handleIgnore = async () => {
    if (confirm('Är du säker på att du vill ignorera backupen? Detta kan inte ångras.')) {
      await clearAutoBackup();
      setDismissed(true);
    }
  };

  const backupDate = new Date(backup.timestamp).toLocaleString('sv-SE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Alert className="mb-4 border-2 border-primary/50 bg-primary/5">
      <div className="flex items-start gap-3">
        <CloudArrowUp size={24} weight="duotone" className="text-primary mt-1" />
        <div className="flex-1">
          <AlertTitle className="font-heading text-lg mb-2 flex items-center gap-2">
            <Database size={20} weight="duotone" />
            Data Recovery Tillgänglig
          </AlertTitle>
          <AlertDescription className="font-body space-y-3">
            <p>
              Ett automatiskt backup hittades från <strong>{backupDate}</strong> med <strong>{backupRatingsCount} betyg</strong>.
            </p>
            <p className="text-sm text-muted-foreground">
              Du har för närvarande bara {currentRatingsCount} betyg. Det verkar som om data har gått förlorad.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Button 
                onClick={handleRestore}
                size="sm"
                className="gap-2"
              >
                <CloudArrowUp size={18} weight="duotone" />
                Återställ backup
              </Button>
              <Button 
                onClick={handleDownloadBackup}
                size="sm"
                variant="outline"
                className="gap-2"
              >
                <Download size={18} weight="duotone" />
                Ladda ner backup
              </Button>
              <Button 
                onClick={onExportBackup}
                size="sm"
                variant="outline"
                className="gap-2"
              >
                <Download size={18} weight="duotone" />
                Backup nuvarande data
              </Button>
              <Button 
                onClick={handleIgnore}
                size="sm"
                variant="ghost"
              >
                <X size={18} />
                Ignorera
              </Button>
            </div>
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
}
