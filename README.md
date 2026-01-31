# Melodifestivalen 2026 - Gruppbetyg

En applikation för att betygsätta och jämföra Melodifestivalen 2026-bidrag tillsammans med vänner och familj.

## 🎵 Funktioner

- **Personliga Profiler**: Flera profiler per GitHub-konto
- **Detaljerade Betyg**: Sex kategorier (Låt, Kläder, Scenografi, Sång, Text, Vykort)
- **Topplistor**: Personliga, grupp- och globala topplistor
- **Jämförelser**: Jämför betyg mellan profiler
- **Export/Import**: Säkerhetskopiera och återställ dina betyg

## ⚠️ VIKTIGT: Data & Backup

### Data sparas lokalt
Din data sparas i applikationens KV-storage och i webbläsarens localStorage. Detta innebär:

- ✅ Snabb åtkomst till dina betyg
- ✅ Ingen cloud-tjänst krävs
- ❌ Data kan gå förlorad vid publicering/uppdateringar
- ❌ Data synkas inte mellan enheter
- ❌ Rensning av webbläsardata raderar betyg

### Säkerhetskopiera regelbundet!

**KRITISKT: Exportera dina betyg regelbundet!**

1. Klicka på "Backup" knappen
2. Välj "Exportera alla betyg (JSON)"
3. Spara filen säkert på din enhet

Gör detta:
- Efter varje betygssession
- Innan appen uppdateras
- Innan du rensar webbläsardata
- Minst en gång i veckan

### Återställning av data

Om data går förlorad:

1. **Automatisk recovery**: Appen visar en recovery-banner om localStorage backup finns
2. **Manuell import**: Använd "Importera backup" för att återställa från JSON-fil
3. **Kontakta ägaren**: Om du är del av en grupp, be ägaren om en kopia

## 🛡️ Tre nivåer av backup

### 1. Automatisk localStorage backup
- Skapas automatiskt vid varje ändring
- Endast på samma enhet/webbläsare
- För nödåterställning

### 2. Manuell JSON export (REKOMMENDERAS)
- Du kontrollerar när backup skapas
- Fungerar på alla enheter
- Kan sparas var som helst

### 3. Bildexport
- För delning på sociala medier
- Visar top 10 bidrag
- Inte för data-återställning

## 🚀 Kom igång

1. Logga in med GitHub
2. Skapa en profil
3. Börja betygsätta bidrag
4. **EXPORTERA DINA BETYG!**

## 📱 Funktioner

### Betygsättning
- Välj deltävling och bidrag
- Sätt betyg 0-10 i sex kategorier
- Lägg till kommentarer (valfritt)
- Se total poäng automatiskt

### Topplistor
- **Global**: Alla betyg från alla användare
- **Grupp**: Genomsnitt för alla profiler i gruppen
- **Personlig**: Dina egna betygsatta bidrag

### Jämförelser
- Jämför betyg mellan olika profiler
- Se skillnader kategori för kategori
- Identifiera gemensamma favoriter

### Export & Import
- Exportera JSON för säkerhetskopiering
- Exportera bild för delning
- Importera från tidigare backup
- Automatisk data recovery

## 🔧 Teknisk information

- React + TypeScript
- Spark KV Storage
- localStorage backup
- Framer Motion animations
- Shadcn UI components

## 🎨 Färgformat-validering

**VIKTIGT för utvecklare**: Denna app använder html2canvas för bildexport, som INTE stödjer moderna färgformat som `oklch()` eller `oklab()`.

### Automatisk validering

Ett enhetstest (`src/components/color-format-validation.test.ts`) säkerställer att endast säkra färgformat används:

```bash
# Kör färgvalidering
npm run test:colors
# eller
npm run validate:colors
```

### Godkända färgformat
- ✅ Hex: `#FFFFFF`, `#87CEEB`
- ✅ HSL: `hsl(340, 50%, 60%)`
- ✅ RGB: `rgb(255, 255, 255)`
- ✅ Named: `gold`, `silver`

### Förbjudna färgformat
- ❌ `oklch()` - Orsakar exportfel
- ❌ `oklab()` - Orsakar exportfel

Se `docs/COLOR_FORMAT_GUIDELINES.md` för fullständig dokumentation.

## 📄 Dokumentation

- `DATA_MODEL.md`: Fullständig datamodell och backup-strategi
- `MIGRATION.md`: Migrations-system för uppdateringar
- `PRD.md`: Produkt-specifikation
- `docs/COLOR_FORMAT_GUIDELINES.md`: Färgformat-riktlinjer

## 📄 License For Spark Template Resources 

The Spark Template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.
