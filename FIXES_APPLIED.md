# Åtgärder för att förhindra dataförlust vid publicering

## Problem
Profiler bevarades efter publicering men betyg försvann. Detta berodde på att:

1. **Initialiseringen körde direkt från useKV-state**: När `entries` var `undefined` vid första render skapades nya tomma entries
2. **localStorage vs spark.kv**: Backup-systemet använde localStorage men data lagrades i spark.kv
3. **Ingen automatisk backup**: Betyg backupades inte automatiskt vid ändringar

## Lösningar implementerade

### 1. Förbättrad datainitalisering (App.tsx)
**Före:** Initialisering körde direkt med `useKV` state som kunde vara undefined
**Efter:** Använder direct KV-access (`spark.kv.get()`) för att läsa data INNAN useKV sätts

```typescript
// Läser direkt från KV-store vid app-start
const storedEntries = await window.spark.kv.get<Entry[]>('mello-entries-v2');
const storedVersion = await window.spark.kv.get<number>('mello-data-version-v2');

// Initialiserar endast om både entries är tomma OCH version är 0
if (currentEntries.length === 0 && currentVersion === 0) {
  // Skapa nya entries
}
```

Detta förhindrar att befintliga betyg skrivs över vid app-start.

### 2. Automatisk backup vid varje betygsändring
**Före:** Manuell backup endast när användaren klickade på export
**Efter:** Automatisk backup körs efter varje betygsändring

```typescript
const handleRating = async (entryId, category, rating, comment) => {
  setEntries((currentEntries) => {
    const updatedEntries = /* uppdatera betyg */;
    
    // Automatisk backup av alla betyg
    createAutoBackupAsync(updatedEntries, users || []);
    
    return updatedEntries;
  });
};
```

### 3. Backup-system migrerat till spark.kv (lib/backup.ts)
**Före:** Använde localStorage som inte är delad mellan publicerade versioner
**Efter:** Använder spark.kv som är persistent backup-lagring

```typescript
// Alla backup-funktioner är nu async och använder spark.kv
export async function createAutoBackup(entries: Entry[], users: User[]): Promise<void>
export async function getAutoBackup(): Promise<LocalBackup | null>
export async function shouldShowBackupWarning(): Promise<boolean>
```

### 4. Backup-påminnelse och återställning (UI)
- **BackupReminder**: Visas när användaren har betyg men ingen backup på 7+ dagar
- **DataRecoveryBanner**: Visas om automatisk backup har fler betyg än nuvarande data

Båda komponenterna är integrerade i huvudvyn och hjälper användaren att:
- Exportera manuell backup (JSON-fil)
- Återställa från automatisk backup om data förlorats
- Få påminnelser om att säkerhetskopiera

### 5. Datamodellsdokumentation (DATA_MODEL.md)
Skapade omfattande dokumentation som förklarar:
- Hur data är strukturerad i KV-store
- Vilka nycklar som används och vad de innehåller
- Hur migrering fungerar
- Hur betyg sparas per profil
- Felsökningsguide för vanliga problem

## Testning

För att verifiera att problemet är löst:

1. **Skapa betyg**: Sätt betyg på några bidrag
2. **Kontrollera automatisk backup**: 
   ```typescript
   await window.spark.kv.get('mello-auto-backup-v2')
   ```
3. **Publicera ny version**: Gör en ändring och publicera
4. **Verifiera efter publicering**: Betyg ska finnas kvar

## Långsiktig säkerhet

### Fortsatt skydd:
1. ✅ Automatisk backup vid varje betygsändring
2. ✅ Backup i spark.kv (delad mellan versioner)
3. ✅ Manuell export/import för användarkontroll
4. ✅ Data recovery banner vid upptäckt dataförlust
5. ✅ Backup-påminnelser

### Rekommendationer:
- Exportera manuell backup regelbundet (användaren uppmanas)
- Använd migration-debug-verktyget (endast för ägare) vid problem
- Testa alltid publicering i staging före production

---

## Fix: Session-isolering och multi-profil datakonsistens (2026-02-01)

### Problem
1. **Alla användare delade samma session** - Session-ID lagrades i global `spark.kv` istället för per-enhet
2. **Profiler överskrevs** - När användare B loggade in fick användare A också användare B:s profil
3. **Ingen datavalidering** - Korrupt eller felaktig data upptäcktes inte
4. **Race condition vid laddning** - Session återställdes innan KV-data var helt laddat

### Lösningar implementerade

#### 1. Session-lagring flyttad till localStorage (session.ts)
**Före:** Session sparades i global `spark.kv` (delad mellan alla användare)
**Efter:** Session sparas i `localStorage` (per enhet/webbläsare)

```typescript
// NU: Varje enhet har sin egen session
export function saveSession(userId: string, profileId: string | null): void {
  localStorage.setItem(SESSION_USER_KEY, userId);
  // ...
}
```

#### 2. Städning av gamla globala sessioner
Ny funktion `cleanupOldKVSession()` körs vid app-start för att ta bort gamla globala session-nycklar från `spark.kv`.

#### 3. Komplett datavalidering med Zod (validation.ts)
Ny fil med Zod-scheman för alla datatyper:
- `UserSchema` - Validerar användare med email-format
- `ProfileSchema` - Validerar profiler med userId-referens
- `EntrySchema` - Validerar bidrag med betyg
- `UserRatingSchema` - Validerar betyg (0-5 per kategori, totalScore 0-30)

```typescript
// Validerar all data vid laddning
const validation = validateKVData(storedUsers, storedEntries);
if (!validation.valid) {
  // Visa felmeddelande
}
if (validation.orphanedRatings.length > 0) {
  // Visa varning om övergivna betyg
}
```

#### 4. Referentiell integritet
Kontrollerar att:
- Varje `Profile.userId` refererar till en existerande `User.id`
- Varje `UserRating.profileId` refererar till en existerande `Profile.id`
- Inga dubbletter av ID:n finns

Övergivna betyg (från raderade profiler) visas som varning men bevaras.

#### 5. KV-laddningstillstånd (App.tsx)
Ny `isKVLoaded` state förhindrar race condition:
```typescript
// Väntar tills KV är laddat innan session återställs
useEffect(() => {
  const restoreSession = () => {
    if (!isKVLoaded) return; // Vänta!
    // ... återställ session
  };
}, [users, isKVLoaded]);
```

### Påverkade filer
- `src/lib/session.ts` - Omskriven för localStorage
- `src/lib/validation.ts` - Ny fil med Zod-validering
- `src/App.tsx` - Uppdaterad sessionshantering och validering
- `src/lib/migration.ts` - Deprecated-markering på gammal validering
- Tester uppdaterade för nya API:er

### Testning
1. Logga in som användare A på enhet 1
2. Logga in som användare B på enhet 2
3. Uppdatera enhet 1 → Ska fortfarande vara användare A
4. Skapa profiler → Varje användare har sina egna profiler

---

## Teknisk sammanfattning

**KV-nycklar som används:**
- `mello-entries-v2` - Alla bidrag med betyg
- `mello-users-v2` - Användare och profiler  
- `mello-data-version-v2` - Datakällans version
- `mello-auto-backup-v2` - Automatisk backup av entries + users
- `mello-last-backup-date-v2` - Senaste backup-datum
- `mello-backup-warning-dismissed-v2` - Om användaren avvisat varning

**localStorage-nycklar (per enhet):**
- `mello-session-user-id` - Inloggad användares ID
- `mello-session-profile-id` - Vald profils ID

**Dataflöde:**
1. App startar → Läser direkt från spark.kv
2. Betyg sätts → Sparas via useKV + automatisk backup
3. Data finns i både primär lagring (`mello-entries-v2`) och backup (`mello-auto-backup-v2`)
4. Vid publicering → Data bevaras i spark.kv
5. Om problem → DataRecoveryBanner erbjuder återställning
