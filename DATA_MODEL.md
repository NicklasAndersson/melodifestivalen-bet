# Melodifestivalen 2026 - Datamodell

## Översikt

Denna applikation använder en normaliserad datastruktur där:
- **Användare** (Users) lagras separat med sina **Profiler**
- **Bidrag** (Entries) lagras separat med alla **Betyg** (Ratings)
- Data persisteras i Spark KV-store med tre primära nycklar

## Persistens Keys (Spark KV)

### `mello-users-v2`
Lagrar alla användare och deras profiler. Varje GitHub-konto kan ha flera profiler.

### `mello-entries-v2`
Lagrar alla Melodifestivalen-bidrag och alla betyg från alla profiler.

### `mello-data-version-v2`
Versionsnummer för att hantera datamigration och uppdateringar av bidragslistan.

---

## Datatyper

### User
Representerar en inloggad GitHub-användare. Varje GitHub-konto skapar en User.

```typescript
interface User {
  id: string;                    // Format: "user-{timestamp}"
  email: string;                 // GitHub email (unik identifierare)
  githubLogin: string;           // GitHub användarnamn
  avatarUrl?: string;            // GitHub profilbild URL
  createdAt: number;             // Unix timestamp (ms)
  profiles: Profile[];           // Array av profiler som tillhör användaren
}
```

**Exempel:**
```json
{
  "id": "user-1738000000000",
  "email": "johan@example.com",
  "githubLogin": "johansson",
  "avatarUrl": "https://avatars.githubusercontent.com/u/123456",
  "createdAt": 1738000000000,
  "profiles": [
    {
      "id": "profile-1738000100000",
      "userId": "user-1738000000000",
      "nickname": "Johan",
      "createdAt": 1738000100000
    },
    {
      "id": "profile-1738000200000",
      "userId": "user-1738000000000",
      "nickname": "Anna",
      "createdAt": 1738000200000
    }
  ]
}
```

**Validering:**
- `email` måste vara unik i systemet
- `id` genereras automatiskt med timestamp
- `profiles` är en array som kan vara tom eller innehålla flera profiler

---

### Profile
Representerar en betygsprofil inom en User. Flera profiler kan finnas per GitHub-konto.

```typescript
interface Profile {
  id: string;              // Format: "profile-{timestamp}"
  userId: string;          // Referens till User.id
  nickname: string;        // Användarens valfria smeknamn
  createdAt: number;       // Unix timestamp (ms)
}
```

**Exempel:**
```json
{
  "id": "profile-1738000100000",
  "userId": "user-1738000000000",
  "nickname": "Johan",
  "createdAt": 1738000100000
}
```

**Validering:**
- `userId` måste referera till en existerande User
- `nickname` kan vara valfri sträng
- Varje profil får unika betyg i systemet

---

### Entry
Representerar ett Melodifestivalen-bidrag med alla betyg från alla profiler.

```typescript
interface Entry {
  id: string;                    // Format: "{artist}-{song}" (normaliserad)
  number: number;                // Bidragsnummer (1-6) inom deltävlingen
  artist: string;                // Artistnamn
  song: string;                  // Låttitel
  heat: string;                  // Deltävling (ex: "Deltävling 1")
  heatDate: string;              // Datum i format "YYYY-MM-DD"
  userRatings: UserRating[];     // Array av alla profilers betyg
}
```

**Exempel:**
```json
{
  "id": "greczula-half-of-me",
  "number": 1,
  "artist": "Greczula",
  "song": "Half of Me",
  "heat": "Deltävling 1",
  "heatDate": "2026-01-31",
  "userRatings": [
    {
      "profileId": "profile-1738000100000",
      "profileName": "Johan",
      "ratings": {
        "song": { "rating": 8, "comment": "Stark melodi" },
        "clothes": { "rating": 7, "comment": "" },
        "scenography": { "rating": 9, "comment": "Imponerande" },
        "vocals": { "rating": 8, "comment": "" },
        "lyrics": { "rating": 7, "comment": "" },
        "postcard": { "rating": 6, "comment": "" }
      },
      "totalScore": 45
    }
  ]
}
```

**Validering:**
- `id` genereras från artist och song (lowercase, spaces → dashes)
- `number` är 1-6 inom varje deltävling
- `heat` måste vara en av de definierade deltävlingarna
- `userRatings` innehåller alla profilers betyg för detta bidrag

---

### UserRating
Representerar en profils kompletta betyg för ett bidrag.

```typescript
interface UserRating {
  profileId: string;             // Referens till Profile.id
  profileName: string;           // Kopia av Profile.nickname (för prestanda)
  ratings: {
    song: CategoryRating;
    clothes: CategoryRating;
    scenography: CategoryRating;
    vocals: CategoryRating;
    lyrics: CategoryRating;
    postcard: CategoryRating;
  };
  totalScore: number;            // Summa av alla rating-värden (0-60)
}
```

**Exempel:**
```json
{
  "profileId": "profile-1738000100000",
  "profileName": "Johan",
  "ratings": {
    "song": { "rating": 8, "comment": "Stark melodi" },
    "clothes": { "rating": 7, "comment": "" },
    "scenography": { "rating": 9, "comment": "Imponerande" },
    "vocals": { "rating": 8, "comment": "" },
    "lyrics": { "rating": 7, "comment": "" },
    "postcard": { "rating": 6, "comment": "" }
  },
  "totalScore": 45
}
```

**Validering:**
- `profileId` måste referera till en existerande Profile
- `profileName` dupliceras här för att undvika lookups vid visning
- `totalScore` beräknas som summan av alla rating-värden
- Alla 6 kategorier måste finnas, även om rating är 0

---

### CategoryRating
Representerar betyg och kommentar för en specifik kategori.

```typescript
interface CategoryRating {
  rating: number;        // Värde 0-10
  comment: string;       // Valfri kommentar
}
```

**Exempel:**
```json
{
  "rating": 8,
  "comment": "Stark melodi med bra hook"
}
```

**Validering:**
- `rating` måste vara 0-10
- `comment` kan vara tom sträng ("")

---

## Kategorier

De sex betygskategorierna som används i systemet:

```typescript
const CATEGORIES = [
  { key: 'song', label: 'Låt', icon: 'MusicNotes' },
  { key: 'clothes', label: 'Kläder', icon: 'Palette' },
  { key: 'scenography', label: 'Scenografi', icon: 'Television' },
  { key: 'vocals', label: 'Sång', icon: 'Microphone' },
  { key: 'lyrics', label: 'Text', icon: 'TextAa' },
  { key: 'postcard', label: 'Vykort', icon: 'Television' },
] as const;

type CategoryKey = 'song' | 'clothes' | 'scenography' | 'vocals' | 'lyrics' | 'postcard';
```

---

## Deltävlingar

Melodifestivalen 2026 består av 5 deltävlingar:

```typescript
const HEATS = [
  "Deltävling 1",
  "Deltävling 2",
  "Deltävling 3",
  "Deltävling 4",
  "Deltävling 5",
] as const;

const HEAT_DATES: Record<string, string> = {
  "Deltävling 1": "2026-01-31",  // Linköping, Saab Arena
  "Deltävling 2": "2026-02-07",  // Göteborg, Scandinavium
  "Deltävling 3": "2026-02-14",  // Kristianstad, Kristianstad Arena
  "Deltävling 4": "2026-02-21",  // Malmö, Malmö Arena
  "Deltävling 5": "2026-02-28",  // Sundsvall, Gärdehov Arena
};
```

Varje deltävling startar kl. 20:00 svensk tid.

---

## Bidragslista

Totalt 30 bidrag fördelade på 5 deltävlingar (6 bidrag per deltävling).

### Deltävling 1 - Linköping (2026-01-31)
1. Greczula - "Half of Me"
2. Jacqline - "Woman"
3. noll2 - "Berusade ord"
4. Junior Lerin - "Copacabana Boy"
5. Indra - "Beautiful Lie"
6. A*Teens - "Iconic"

### Deltävling 2 - Göteborg (2026-02-07)
1. Arwin - "Glitter"
2. Laila Adèle - "Oxygen"
3. Robin Bengtsson - "Honey Honey"
4. FELICIA - "My System"
5. Klara Almström - "Där hela världen väntar"
6. Brandsta City Släckers - "Rakt in i elden"

### Deltävling 3 - Kristianstad (2026-02-14)
1. Patrik Jean - "Dusk Till Dawn"
2. Korslagda - "King of Rock 'n' Roll"
3. Emilia Pantić - "Ingenting"
4. Medina - "Viva L'Amor"
5. Eva Jumatate - "Selfish"
6. Saga Ludvigsson - "Ain't Today"

### Deltävling 4 - Malmö (2026-02-21)
1. Cimberly - "Eternity"
2. Timo Räisänen - "Ingenting är efter oss"
3. Meira Omar - "Dooset Daram"
4. Felix Manu - "Hatar att jag älskar dig"
5. Erika Jonsson - "Från landet"
6. Smash Into Pieces - "Hollow"

### Deltävling 5 - Sundsvall (2026-02-28)
1. AleXa - "Tongue Tied"
2. JULIETT - "Långt från alla andra"
3. Bladë - "Who You Are"
4. Lilla Al-Fadji - "Delulu"
5. Vilhelm Buchaus - "Hearts Don't Lie"
6. Sanna Nielsen - "Waste Your Love"

---

## Dataflöde

### 1. Användarskapande
```
GitHub SSO Login
    ↓
Hämta GitHub-användardata (email, login, avatar)
    ↓
Sök efter User med samma email i mello-users-v2
    ↓
Om hittas: Logga in
Om inte: Skapa ny User → Spara i mello-users-v2
```

### 2. Profilskapande
```
Användare klickar "Skapa profil"
    ↓
Ange smeknamn
    ↓
Skapa ny Profile med userId-referens
    ↓
Lägg till Profile i User.profiles[]
    ↓
Uppdatera mello-users-v2
```

### 3. Betygssättning
```
Välj profil
    ↓
Välj bidrag (Entry)
    ↓
Sätt betyg (0-10) och kommentar för varje kategori
    ↓
Hitta eller skapa UserRating i Entry.userRatings[]
    ↓
Uppdatera CategoryRating för vald kategori
    ↓
Beräkna om totalScore
    ↓
Spara Entry i mello-entries-v2
```

### 4. Radering av betyg
```
Välj bidrag med befintligt betyg
    ↓
Klicka "Radera betyg"
    ↓
Filtrera bort UserRating för aktuell profileId från Entry.userRatings[]
    ↓
Spara Entry i mello-entries-v2
```

---

## Datarelationer

```
User (1) ←→ (N) Profile
  ↓ email är unik identifierare
  ↓ profiles[] innehåller alla profiler

Profile (1) ←→ (N) UserRating
  ↓ profileId refererar till Profile.id
  ↓ profileName kopieras för prestanda

Entry (1) ←→ (N) UserRating
  ↓ userRatings[] innehåller alla profilers betyg
  ↓ Ett Entry kan ha 0 till många UserRatings

UserRating (1) ←→ (6) CategoryRating
  ↓ ratings.{category} innehåller betyg för varje kategori
  ↓ Alltid exakt 6 kategorier per UserRating
```

---

## Dataduplicering och Normalisering

### Accepterad Duplicering (för prestanda)
1. **profileName i UserRating**: Kopieras från Profile.nickname för att undvika lookups vid visning
2. **heatDate i Entry**: Kopieras från HEAT_DATES för att undvika lookups

### Eliminerad Duplicering
1. **Betyg lagras ENDAST i Entry.userRatings[]**: Betyg lagras inte separat utan alltid som del av Entry
2. **Profiler lagras ENDAST i User.profiles[]**: Profiler lagras inte separat utan alltid som del av User
3. **Bidragsinformation dupliceras INTE**: Artist, song, heat, etc. finns endast i Entry, aldrig i UserRating

---

## Datamigration

När bidragslistan uppdateras (t.ex. nya artister eller korrigeringar):

1. Öka `CURRENT_DATA_VERSION` i App.tsx
2. Ändra `MELODIFESTIVALEN_2026` i melodifestivalen-data.ts
3. Vid nästa laddning körs `initializeEntries()` som:
   - Skapar nya Entry-objekt från MELODIFESTIVALEN_2026
   - **BEVARAR INTE gamla betyg** (betyg går förlorade vid datamigration)
4. Uppdaterar `mello-data-version-v2`

**OBS:** Betyg bevaras INTE vid datamigration. Överväg att implementera migration-logik om betyg ska bevaras.

---

## KV Store Struktur

```
spark.kv
├── "mello-users-v2": User[]
│   └── Varje User innehåller profiles[]
│
├── "mello-entries-v2": Entry[]
│   └── Varje Entry innehåller userRatings[]
│       └── Varje UserRating innehåller ratings{}
│
└── "mello-data-version-v2": number
    └── Versionsnummer för datamigration
```

---

## Beräkningar

### Total Score
Summan av alla 6 kategori-ratings för en UserRating:
```typescript
totalScore = song.rating + clothes.rating + scenography.rating + 
             vocals.rating + lyrics.rating + postcard.rating
```
Min: 0, Max: 60

### Global Leaderboard
Visar alla bidrag sorterade efter genomsnittligt totalScore från alla profiler:
```typescript
averageScore = sum(entry.userRatings[].totalScore) / entry.userRatings.length
```

### Personal Leaderboard
Visar alla bidrag sorterade efter en specifik profils totalScore.

### Group Leaderboard
Visar alla bidrag sorterade efter genomsnittligt totalScore från alla profiler i samma User (alla profiler som delar samma GitHub-konto).

---

## Säkerhetsaspekter

1. **GitHub SSO**: Autentisering via GitHub, ingen lösenordshantering
2. **Email som identifierare**: GitHub email används som unik identifierare för Users
3. **Ingen data-isolation**: Alla betyg är synliga för alla användare (ingen ACL)
4. **Ingen audit log**: Ingen historik över ändringar sparas

---

## Prestandaoptimering

1. **Denormaliserad profileName**: Undviker O(n) lookup vid rendering av betyg
2. **In-memory state**: React state används för UI, synkroniseras till KV store
3. **Functional updates**: Alla KV-uppdateringar använder functional updates för att undvika race conditions

---

## Förbättringsförslag

### Kritiska förbättringar
1. **Bevara betyg vid datamigration**: Implementera merge-logik för att behålla betyg när bidragslistan uppdateras
2. **Validering av Entry.id**: Säkerställ att id-generering är konsekvent och unik
3. **Orphan cleanup**: Ta bort UserRatings för profiler som inte längre existerar

### Icke-kritiska förbättringar
1. **Timestamps på betyg**: Lägg till createdAt/updatedAt på UserRating
2. **Audit log**: Spåra ändringar för troubleshooting
3. **Profile deletion**: Lägg till möjlighet att ta bort profiler (och deras betyg)
4. **Backup/Export**: Exportera all användardata till JSON
