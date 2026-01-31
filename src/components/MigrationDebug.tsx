import { useState } from 'react';
import { Entry } from '@/lib/types';
import { migrateEntries, validateEntries, getDataVersion } from '@/lib/migration';
import { testMigrationScenarios } from '@/lib/migration-test';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, Bug, CheckCircle, WarningCircle, Info } from '@phosphor-icons/react';
import { Separator } from '@/components/ui/separator';

interface MigrationDebugProps {
  entries: Entry[];
  currentVersion: number;
  onBack: () => void;
  onMigrate: (newEntries: Entry[]) => void;
}

export function MigrationDebug({ entries, currentVersion, onBack, onMigrate }: MigrationDebugProps) {
  const [migrationResult, setMigrationResult] = useState<any>(null);
  const [validationResult, setValidationResult] = useState<any>(null);
  
  const expectedVersion = getDataVersion();
  const needsMigration = currentVersion !== expectedVersion;
  
  const totalRatings = entries.reduce((sum, e) => sum + e.userRatings.length, 0);
  const entriesWithRatings = entries.filter(e => e.userRatings.length > 0).length;

  const handleTestMigration = () => {
    const { entries: newEntries, result } = migrateEntries(entries);
    setMigrationResult(result);
    
    const validation = validateEntries(newEntries);
    setValidationResult(validation);
  };

  const handleApplyMigration = () => {
    const { entries: newEntries, result } = migrateEntries(entries);
    const validation = validateEntries(newEntries);
    
    if (validation.valid) {
      onMigrate(newEntries);
    } else {
      setValidationResult(validation);
    }
  };

  const handleRunTests = () => {
    testMigrationScenarios();
    alert('Check browser console for test results');
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={onBack} className="gap-2">
              <ArrowLeft size={18} />
              Tillbaka
            </Button>
            <h1 className="font-serif text-3xl font-bold text-foreground flex items-center gap-2">
              <Bug size={32} weight="duotone" className="text-primary" />
              Migration Debug
            </h1>
          </div>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info size={24} weight="duotone" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nuvarande version</p>
                  <p className="text-2xl font-bold">{currentVersion}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Förväntad version</p>
                  <p className="text-2xl font-bold">{expectedVersion}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Antal bidrag</p>
                  <p className="text-2xl font-bold">{entries.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Totala betyg</p>
                  <p className="text-2xl font-bold">{totalRatings}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Betygsatta bidrag</p>
                  <p className="text-2xl font-bold">{entriesWithRatings}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Migration krävs</p>
                  <Badge variant={needsMigration ? 'destructive' : 'default'} className="mt-2">
                    {needsMigration ? 'Ja' : 'Nej'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Migreringsåtgärder</CardTitle>
              <CardDescription>
                Testa eller tillämpa datamigration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={handleTestMigration} className="w-full gap-2">
                <Bug size={18} weight="duotone" />
                Testa migrering (Dry Run)
              </Button>
              <Button onClick={handleApplyMigration} variant="outline" className="w-full gap-2">
                <CheckCircle size={18} weight="duotone" />
                Tillämpa migrering
              </Button>
              <Button onClick={handleRunTests} variant="secondary" className="w-full gap-2">
                <Info size={18} weight="duotone" />
                Kör enhetstester
              </Button>
            </CardContent>
          </Card>

          {migrationResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {migrationResult.migratedCount === migrationResult.totalRatings ? (
                    <CheckCircle size={24} weight="duotone" className="text-green-500" />
                  ) : (
                    <WarningCircle size={24} weight="duotone" className="text-yellow-500" />
                  )}
                  Migreringsresultat
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Migrerade</p>
                    <p className="text-2xl font-bold text-green-600">{migrationResult.migratedCount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Förlorade</p>
                    <p className="text-2xl font-bold text-red-600">{migrationResult.lostCount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Totalt</p>
                    <p className="text-2xl font-bold">{migrationResult.totalRatings}</p>
                  </div>
                </div>

                {migrationResult.totalRatings > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Framgångsgrad</p>
                    <div className="h-4 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${(migrationResult.migratedCount / migrationResult.totalRatings) * 100}%` }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {((migrationResult.migratedCount / migrationResult.totalRatings) * 100).toFixed(1)}%
                    </p>
                  </div>
                )}

                {migrationResult.unmatchedEntries.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium mb-2">Omatchade bidrag:</p>
                      <ScrollArea className="h-40 rounded border p-3">
                        <ul className="space-y-1 text-sm">
                          {migrationResult.unmatchedEntries.map((entry: string, i: number) => (
                            <li key={i} className="text-muted-foreground">• {entry}</li>
                          ))}
                        </ul>
                      </ScrollArea>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {validationResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {validationResult.valid ? (
                    <CheckCircle size={24} weight="duotone" className="text-green-500" />
                  ) : (
                    <WarningCircle size={24} weight="duotone" className="text-red-500" />
                  )}
                  Valideringsresultat
                </CardTitle>
              </CardHeader>
              <CardContent>
                {validationResult.valid ? (
                  <Alert>
                    <CheckCircle size={18} weight="duotone" />
                    <AlertTitle>Validering lyckades</AlertTitle>
                    <AlertDescription>
                      All data är korrekt formaterad och klar för användning.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert variant="destructive">
                    <WarningCircle size={18} weight="duotone" />
                    <AlertTitle>Valideringsfel</AlertTitle>
                    <AlertDescription>
                      <ScrollArea className="h-40 mt-2">
                        <ul className="space-y-1 text-sm">
                          {validationResult.errors.map((error: string, i: number) => (
                            <li key={i}>• {error}</li>
                          ))}
                        </ul>
                      </ScrollArea>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Bidragslista</CardTitle>
              <CardDescription>Aktuella bidrag med betyg</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {entries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-3 rounded border hover:bg-accent/5"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{entry.artist}</p>
                        <p className="text-sm text-muted-foreground">{entry.song}</p>
                        <p className="text-xs text-muted-foreground">
                          {entry.heat} #{entry.number}
                        </p>
                      </div>
                      <Badge variant={entry.userRatings.length > 0 ? 'default' : 'outline'}>
                        {entry.userRatings.length} betyg
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
