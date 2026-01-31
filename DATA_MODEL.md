# Datamodell - Melodifestivalen 2026 Gruppbetyg

## Översikt
Applikationen använder `spark.kv` (key-value store) för att spara all data permanent. Data delas mellan alla användare som har tillgång till den publicerade appen.

## KV-nycklar

### `mello-users-v2`
**Typ:** `User[]`

Innehåller alla användare (GitHub-konton) och deras profiler.

```typescript
interface User {
  id: string;              // Unikt ID, format: "user-{timestamp}"
  email: string;           // GitHub email
  githubLogin: string;     // GitHub användarnamn
  avatarUrl?: string;      // GitHub avatar URL
  createdAt: number;       // Unix timestamp
  profiles: Profile[];     // Array av profiler som tillhör denna användare
}

interface Profile {
  id: string;              // Unikt ID, format: "profile-{timestamp}"
  userId: string;          // Referens till parent User.id
  nickname: string;        // Profilnamn (valfritt smeknamn)
  createdAt: number;       // Unix timestamp
}
```

**Användning:**
- En användare (GitHub-konto) kan ha flera profiler
- Varje profil kan ge betyg oberoende av varandra
- Profiler grupperas under sin ägaranvändare

### `mello-entries-v2`
**Typ:** `Entry[]`

Innehåller alla Melodifestivalen 2026-bidrag och alla betyg från alla profiler.

```typescript
interface Entry {
  id: string;              // Unikt ID, format: "{artist}-{song}" (lowercase, kebab-case)
  number: number;          // Bidragsnummer (1-6 per deltävling)
  artist: string;          // Artistnamn
  song: string;            // Låttitel
  heat: string;            // Deltävling, t.ex. "Deltävling 1"
  heatDate: string;        // ISO datum, t.ex. "2026-01-31"
  userRatings: UserRating[]; // Array av betyg från alla profiler
}

interface UserRating {
  profileId: string;       // Referens till Profile.id
  profileName: string;     // Profilnamn (duplicerat för snabb åtkomst)
  ratings: {
    song: CategoryRating;
    clothes: CategoryRating;
    scenography: CategoryRating;
    vocals: CategoryRating;
    lyrics: CategoryRating;
    postcard: CategoryRating;
  };
  totalScore: number;      // Summa av alla ratings (0-30)
}

interface CategoryRating {
  rating: number;          // Betyg 0-5 stjärnor
  comment: string;         // Valfri kommentar
}
```

**Viktigt:**
- Varje Entry innehåller ALLA betyg från ALLA profiler i `userRatings[]`
- När en profil sätter betyg uppdateras Entry.userRatings med den profilens UserRating
- Andra profilers betyg påverkas ALDRIG när en profil uppdaterar sitt betyg

### `mello-data-version-v2`
**Typ:** `number`

Versionsnummer för datakällan (MELODIFESTIVALEN_2026).

**Beräkning:**
```typescript
version = (antal_bidrag * 1000) + (summa_av_alla_bidragsnummer)
```

**Användning:**
- Detekterar när bidragslistan har uppdaterats
- Triggar automatisk migrering av betyg till nya bidrag
- Förhindrar dataförlust vid uppdateringar

## Dataflöde

### Vid första start
1. App läser `mello-entries-v2` och `mello-data-version-v2` direkt från `spark.kv`
2. Om data saknas eller versionen är fel: initiera/migrera
3. Nya entries skapas från `MELODIFESTIVALEN_2026` med tomma `userRatings`

### Vid migrering (ny version)
1. Gammal data läses från KV-store
2. Nya entries skapas från uppdaterad `MELODIFESTIVALEN_2026`
3. Betyg matchas från gamla entries till nya via:
   - ID-matchning (exakt)
   - Normaliserad artist + låt matchning
   - Låttitel matchning
   - Ord-överlapp i artist/låt
   - Bidragsnummer + deltävling matchning
4. Matchade betyg kopieras över till nya entries
5. Uppdaterad data sparas tillbaka till KV-store

### Vid användarlogin
1. GitHub SSO hämtar användarinfo via `spark.user()`
2. Söker efter User med matchande email i `mello-users-v2`
3. Om användaren inte finns: skapa ny User
4. Om användaren finns: ladda dess profiler

### Vid betygsättning
1. Identifiera rätt Entry via entry.id
2. Filtrera ut andra profilers ratings (bevara oförändrat)
3. Skapa/uppdatera den aktuella profilens UserRating
4. Kombinera andra profilers ratings + uppdaterad rating
5. Spara tillbaka till `mello-entries-v2` via `setEntries()`

### Vid backup/export
1. Filtrera entries för att få endast aktuell profils betyg
2. Exportera som JSON med metadata (version, datum, profileId)
3. Vid import: matcha entries via ID och ersätt aktuell profils betyg

## Säkerhet och integritet

### Race conditions
- `useKV` hanterar concurrent updates
- Använd funktionella updates: `setEntries(current => ...)`
- Läs ALLTID från `current` parameter, ALDRIG från closure

### Datavalidering
- Validering körs efter varje migrering
- Kontrollerar: ID-unikhet, obligatoriska fält, rätt datatyper
- Validering misslyckas: migrering avbryts, gamla data behålls

### Backup-strategi
1. Manuell backup via "Backup"-knapp (exporterar JSON)
2. Automatisk backup-påminnelse efter X antal betyg
3. Import kan återställa betyg från backup-fil
4. Backup-filer är profilerade (innehåller endast en profils betyg)

## Felsökning

### Problem: Betyg försvinner efter publicering
**Orsak:** useKV läses asynkront, värdet kan vara undefined initialt
**Lösning:** Använd direct KV-access (`spark.kv.get()`) vid app-init innan useKV

### Problem: Dubblerade betyg
**Orsak:** Fel logik i merge-funktionen
**Lösning:** Filtrera alltid bort aktuell profils gamla rating innan merge

### Problem: Profiler försvinner inte men betyg gör det
**Orsak:** Users sparas i separat KV-key, entries kan skrivas över
**Lösning:** Använd samma merge-strategi för entries som för users

## Framtida förbättringar

1. **Relation-baserad datamodell:** Använd separata KV-keys per profil för betyg
   - Nyckel: `profile-ratings-{profileId}`
   - Fördel: Inga konflikter mellan profiler
   - Nackdel: Mer komplex global leaderboard

2. **Inkrementell backup:** Spara ändringar löpande
   - Automatisk export vid varje betygsändring
   - Använd localStorage som cache

3. **Konflikthantering:** Visa diff vid import
   - Låt användare välja vilka betyg som ska behållas
   - Merge-strategi istället för overwrite
