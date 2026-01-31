import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Warning, X, Download } from '@phosphor-icons/react';
import { dismissBackupWarning, clearBackupWarningDismissal } from '@/lib/backup';

interface BackupReminderProps {
  onBackupClick: () => void;
  show: boolean;
}

export function BackupReminder({ onBackupClick, show }: BackupReminderProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !show) return null;

  const handleDismiss = async () => {
    await dismissBackupWarning();
    setDismissed(true);
  };

  const handleBackup = async () => {
    await clearBackupWarningDismissal();
    onBackupClick();
    setDismissed(true);
  };

  return (
    <Alert className="mb-4 border-2 border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
      <div className="flex items-start gap-3">
        <Warning size={24} weight="duotone" className="text-yellow-600 dark:text-yellow-500 mt-1" />
        <div className="flex-1">
          <AlertTitle className="font-heading text-lg mb-2">
            Säkerhetskopiera dina betyg
          </AlertTitle>
          <AlertDescription className="font-body space-y-3">
            <p className="text-yellow-900 dark:text-yellow-100">
              <strong>Viktigt:</strong> Din data sparas i appen. Om appen uppdateras kan dina betyg 
              påverkas om de inte migreras korrekt. Backupen omfattar alla dina profilers betyg.
            </p>
            <p className="text-yellow-900 dark:text-yellow-100 text-sm">
              Exportera alla dina profilers betyg regelbundet för att säkerställa att du inte förlorar dem.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Button 
                onClick={handleBackup}
                size="sm"
                className="gap-2 bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                <Download size={18} weight="duotone" />
                Säkerhetskopiera nu
              </Button>
              <Button 
                onClick={handleDismiss}
                size="sm"
                variant="ghost"
                className="gap-2 text-yellow-900 dark:text-yellow-100"
              >
                <X size={18} />
                Påminn senare
              </Button>
            </div>
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
}
