# Användarguide: Säkerhetskopiering & Data Recovery

## Varför behöver jag säkerhetskopiera?

Din data sparas i applikationens storage-system som **kan nollställas** när appen uppdateras eller publiceras på nytt. Detta är en begränsning i hur systemet fungerar.

### När kan data gå förlorad?

- 🔄 När appen uppdateras/publiceras
- 🗑️ När du rensar webbläsardata
- 💻 När du byter enhet eller webbläsare
- 🔒 I privat/inkognito-läge
- 📦 När storage-kvoten överskrids

## Hur skyddar jag min data?

### ✅ GÖR DETTA: Manuell backup (REKOMMENDERAT)

1. Klicka på **"Backup"** knappen i huvudmenyn
2. Välj fliken **"Säkerhetskopiera"**
3. Klicka **"Exportera alla betyg (JSON)"**
4. Spara filen på ett säkert ställe (t.ex. Google Drive, Dropbox, eller lokal disk)

**Viktigt:** Backupen omfattar **ALLA dina profilers betyg** på kontot. En enda backup-fil innehåller betyg från alla profiler du har skapat.

**Gör detta:**
- ✅ Efter varje gång du satt betyg
- ✅ Innan du stänger webbläsaren
- ✅ Minst en gång i veckan
- ✅ Innan du vet att appen ska uppdateras

### 🆘 Automatisk backup (Nödlösning)

Appen skapar automatiskt en backup i webbläsarens localStorage. Detta är **INTE** en ersättning för manuell backup!

**Begränsningar:**
- ❌ Försvinner om du rensar webbläsardata
- ❌ Fungerar bara i samma webbläsare på samma enhet
- ❌ Har begränsad storlek
- ❌ Fungerar inte i privat/inkognito-läge

**Används för:**
- ✅ Snabb återställning om något går fel
- ✅ Upptäcka dataförlust
- ✅ Tillfällig säkerhet mellan manuella backups

## Backup-format (Version 2)

Din backup-fil innehåller:
- **accountId**: Ditt unika konto-ID
- **accountEmail**: Din e-postadress
- **githubLogin**: Ditt GitHub-användarnamn
- **profiles**: Lista över alla dina profiler (ID, smeknamn, skapandedatum)
- **entries**: Alla bidrag med betyg från ALLA dina profiler

### Exempel på backup-struktur:

```json
{
  "version": 2,
  "exportDate": "2026-02-01T10:30:00.000Z",
  "accountId": "user-1234",
  "accountEmail": "user@example.com",
  "githubLogin": "myusername",
  "profiles": [
    {
      "id": "profile-1",
      "nickname": "Alice",
      "createdAt": 1704067200000
    },
    {
      "id": "profile-2",
      "nickname": "Bob",
      "createdAt": 1704153600000
    }
  ],
  "entries": [
    {
      "id": "entry-1",
      "artist": "Artist Name",
      "song": "Song Name",
      "userRatings": [
        {
          "profileId": "profile-1",
          "profileName": "Alice",
          "ratings": { ... },
          "totalScore": 24
        },
        {
          "profileId": "profile-2",
          "profileName": "Bob",
          "ratings": { ... },
          "totalScore": 22
        }
      ]
    }
  ]
}
```

## Hur återställer jag data?

### Scenario 1: Data har försvunnit (Automatisk recovery)

Om appen upptäcker att data har försvunnit men en localStorage backup finns, visas en **gul banner** högst upp.

**Alternativ:**
1. **Återställ backup** - Återställer all data från localStorage
2. **Ladda ner backup** - Sparar localStorage backup som JSON-fil
3. **Backup nuvarande data** - Säkerhetskopiera vad som finns nu först
4. **Ignorera** - Tar bort localStorage backup (varning: går ej ångra!)

### Scenario 2: Manuell återställning från JSON-fil

1. Klicka på **"Backup"** knappen
2. Välj fliken **"Säkerhetskopiera"**
3. Klicka **"Välj backup-fil"**
4. Välj din JSON-fil
5. Bekräfta återställningen

**Viktigt:**
- Vid återställning av Version 2 backup importeras **ALLA profilers betyg**
- Profiler matchas automatiskt baserat på smeknamn eller ID
- Om en profil med samma smeknamn finns, återställs betygen till den profilen
- Återställning skriver över nuvarande betyg för de importerade bidragen
- Andra användares betyg (utanför ditt konto) påverkas inte

### Scenario 3: Ingen backup finns

Om du har förlorat all data och inte har någon backup:
1. Kontakta andra i din grupp - de kan dela sina backups
2. Om du är ägare och ingen har backup är data förlorad
3. Du måste börja om från början

## Backup-påminnelser

### Gul varningsruta

Om du inte har exporterat på 7 dagar, visas en påminnelse:

**"Säkerhetskopiera dina betyg"**
- Detta är en viktig påminnelse
- Klicka **"Säkerhetskopiera nu"** för att skydda alla dina profilers data
- **"Påminn senare"** - Får påminnelse igen senare

## Best Practices

### ✅ REKOMMENDERAT

1. **Exportera efter varje session**
   - Ta för vana att exportera när du är klar
   - En backup innehåller alla profilers betyg
   
2. **Spara på flera ställen**
   - Google Drive, Dropbox, email till dig själv
   - Ha minst 2 kopior på olika platser

3. **Namnge filer tydligt**
   - Standard: `melodifestivalen-2026-backup-[användarnamn]-[datum].json`
   - Behåll detta format för att enkelt hitta rätt backup

4. **Testa återställning**
   - Prova att importera din backup i en annan webbläsare
   - Bekräfta att alla profilers betyg finns med

5. **En backup räcker per konto**
   - Eftersom backupen innehåller alla profiler behöver du bara en backup per konto
   - Alla profilers betyg återställs tillsammans

### ❌ UNDVIK

1. **Räkna med localStorage**
   - Använd det inte som enda backup
   
2. **Vänta för länge**
   - Exportera ofta, inte bara när du kommer ihåg

3. **Radera gamla backups**
   - Behåll minst de senaste 3-5 backuperna

4. **Ignorera varningar**
   - Om appen varnar dig, agera direkt

## Dela din topplista

För att dela din topplista på sociala medier:

1. Klicka på **"Backup"**
2. Välj fliken **"Dela topplista"**
3. Klicka **"Ladda ner som bild"**
4. Bilden innehåller dina topp 10 bidrag (för nuvarande profil)
5. Dela på Instagram, Facebook, etc.

**OBS:** Detta är INTE en backup! Det är bara för delning av en enskild profils topplista.

## Felsökning

### "Kunde inte importera betyg"

**Möjliga orsaker:**
- Filen är korrupt eller fel format
- Filen är inte en giltig JSON-fil
- Backup-versionen är inkompatibel

**Lösning:**
1. Kontrollera att det är rätt fil (`.json`)
2. Försök öppna filen i en text-editor - ska innehålla JSON
3. Försök en äldre backup om du har flera
4. Version 1 backups (gamla, en profil) stöds fortfarande men importerar bara till nuvarande profil

### "Ingen data att exportera"

**Orsak:**
- Inga av dina profiler har satt några betyg än

**Lösning:**
- Börja betygsätta bidrag först
- Du kan fortfarande importera en backup om du har en

### localStorage backup saknas

**Orsak:**
- Du har rensat webbläsardata
- Private/incognito mode används
- localStorage är fullt

**Lösning:**
- Använd din manuella JSON-backup
- Starta webbläsaren i vanligt läge (inte private/incognito)

## Support

Om du fortfarande har problem:

1. Kontrollera att du använder en modern webbläsare
2. Försök i ett annat fönster/flik
3. Kontakta app-ägaren för hjälp
4. Kolla console (F12) för felmeddelanden

## Sammanfattning

| Vad | När | Omfattning | Viktig? |
|-----|-----|------------|---------|
| **Manuell JSON Export** | Efter varje session | Alla profilers betyg | ⭐⭐⭐⭐⭐ KRITISK |
| **localStorage backup** | Automatiskt | Alla profilers betyg | ⭐⭐⭐ Nödlösning |
| **Bildexport** | För delning | Nuvarande profils topplista | ⭐ Ej backup |

**VIKTIGAST:** 
- Exportera JSON regelbundet! Det är din enda garanti att behålla alla dina profilers betyg.
- En enda backup-fil innehåller alla profiler - du behöver inte exportera separat för varje profil.
- Vid import återställs alla profilers betyg samtidigt.
