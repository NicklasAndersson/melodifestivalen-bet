# URL Navigation

Applikationen använder URL-parametrar för att spara navigeringstillstånd. Detta gör det möjligt att dela länkar till specifika vyer och behålla vyn vid omladdning.

## URL-parametrar

### `view`
Anger vilken vy som visas:
- `main` - Huvudvy med bidragskort (standard)
- `global` - Global topplista
- `personal` - Personlig topplista
- `group` - Grupptopplista
- `entry` - Betygssättningsvy för ett specifikt bidrag
- `comparison` - Jämförelsevy mellan profilers betyg

### `heat`
Anger vilken deltävling som visas:
- `Deltävling 1`, `Deltävling 2`, `Deltävling 3`, `Deltävling 4`, `Deltävling 5`, `Final`
- Standard: `Deltävling 1`

### `entry`
Anger vilket bidrag som visas (endast relevant för `view=entry` och `view=comparison`):
- Värde: Entry ID (t.ex. `greczula-half-of-me`)

## Exempel-URLs

```
# Huvudvy, Deltävling 1
?view=main&heat=Deltävling%201

# Global topplista, Deltävling 3
?view=global&heat=Deltävling%203

# Betygssättning för specifikt bidrag
?view=entry&heat=Deltävling%201&entry=greczula-half-of-me

# Jämförelse mellan profilers betyg
?view=comparison&heat=Deltävling%202&entry=arwin-glitter
```

## Implementation

URL-parametrar uppdateras automatiskt när användaren navigerar genom applikationen:
- Byta deltävling → uppdaterar `heat`
- Öppna topplista → uppdaterar `view`
- Klicka på bidrag → uppdaterar `view` och `entry`
- Gå tillbaka → återställer `view`

Vid sidladdning läses parametrarna och rätt vy återställs automatiskt.
