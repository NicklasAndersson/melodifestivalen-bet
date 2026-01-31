# Riktlinjer för färgformat

## Problem med oklch och oklab

**KRITISKT:** Använd ALDRIG `oklch()` eller `oklab()` färgformat i denna applikation.

### Varför?

html2canvas (biblioteket vi använder för bildexport) har **inte stöd** för moderna CSS-färgformat som `oklch()` och `oklab()`. När dessa färgformat används i komponenter som ska exporteras som bilder, kommer följande fel att uppstå:

```
Error: Attempting to parse an unsupported color function "oklch"
```

Detta har varit ett återkommande problem i projektet där export-funktionalitet har brutits flera gånger.

### Historik

Detta problem har återinförts flera gånger:
- Export av grupptopplista misslyckades
- Export av personlig topplista misslyckades  
- Export av global topplista misslyckades

Varje gång var orsaken densamma: någon hade använt `oklch()` eller `oklab()` färgformat.

## Godkända färgformat

### ✅ ANVÄND DESSA

#### Hex-färger
```css
color: #FFFFFF;
color: #87CEEB;  /* Silver/Sky blue */
color: #CD7F32;  /* Bronze */
color: #e8cd8c;  /* Gold */
```

#### HSL-färger (REKOMMENDERAT för CSS-variabler)
```css
/* I index.css */
:root {
  --primary: 340 50% 60%;
  --gold: 45 80% 65%;
  --background: 320 30% 96%;
}

/* I @theme block */
@theme {
  --color-primary: hsl(var(--primary));
  --color-gold: hsl(var(--gold));
}
```

#### RGB-färger
```css
color: rgb(255, 255, 255);
background: rgba(232, 205, 140, 0.1);
```

#### Namngivna färger
```css
color: gold;
color: silver;
```

#### CSS-variabler
```tsx
className="text-gold bg-primary"
style={{ color: 'var(--color-gold)' }}
```

### ❌ ANVÄND ALDRIG DESSA

```css
/* DESSA KOMMER ATT ORSAKA EXPORTFEL */
color: oklch(0.6 0.12 340);
background: oklab(0.65 0.15 0.08);
```

## Implementering i komponenter

### Rätt sätt att använda färger i komponenter som exporteras

```tsx
// ✅ KORREKT: Hex-färger
<Card className="border-[#e8cd8c80]" />
<Medal className="text-[#87CEEB]" />

// ✅ KORREKT: CSS-variabler (definierade med HSL i index.css)
<div className="text-gold bg-primary" />

// ✅ KORREKT: Inline styles med hex eller rgba
<div style={{
  background: 'linear-gradient(to bottom right, rgba(232, 205, 140, 0.1) 0%, transparent 100%)'
}} />

// ❌ FEL: oklch/oklab
<div className="border-[oklch(0.6_0.12_340)]" />
<div style={{ color: 'oklab(0.65 0.15 0.08)' }} />
```

## Komponenter som MÅSTE vara export-säkra

Dessa komponenter används med html2canvas och får ABSOLUT INTE innehålla oklch/oklab:

- `GroupLeaderboard.tsx`
- `PersonalLeaderboard.tsx`  
- `GlobalLeaderboard.tsx`
- Alla komponenter som renderas i dessa

## Automatisk validering

### Enhetstest

Ett omfattande enhetstest finns i `src/components/color-format-validation.test.ts` som:

1. Skannar ALLA komponentfiler (.tsx, .ts)
2. Kontrollerar CSS-filen (index.css)
3. Letar efter oklch/oklab i:
   - className-attribut
   - Template literals
   - Tailwind arbitrary values
   - Inline styles
   - CSS-variabler

### Köra testet

```bash
npm test color-format-validation
```

Om testet misslyckas, kommer det att visa:
- Exakt vilken fil som innehåller problemet
- Vilken rad problemet finns på
- Vad som behöver ändras

### CI/CD Integration

Detta test körs automatiskt i CI/CD-pipelinen och kommer att **blockera deployment** om oklch/oklab färger hittas.

## Konvertera från oklch/oklab till HSL

Om du har en oklch-färg som behöver konverteras:

1. Använd verktyg som https://oklch.com
2. Kopiera HSL-värdet
3. Använd det i HSL-format

Exempel:
```css
/* Före (FEL) */
--primary: oklch(0.6 0.12 340);

/* Efter (KORREKT) */
--primary: 340 50% 60%;
```

## Kontrollista innan commit

- [ ] Har jag lagt till några nya färger?
- [ ] Använder jag hex, HSL, RGB eller namngivna färger?
- [ ] Har jag INTE använt oklch eller oklab?
- [ ] Kör `npm test color-format-validation` innan commit
- [ ] Testet passerar utan fel

## Mer information

- html2canvas dokumentation: https://html2canvas.hertzen.com/
- CSS Color Module Level 4: https://www.w3.org/TR/css-color-4/
- Browser support för oklch: https://caniuse.com/css-lch-lab

## Sammanfattning

**VIKTIGT:** För att undvika att exportfunktionaliteten går sönder:

1. ✅ Använd hex, HSL, RGB eller namngivna färger
2. ❌ Använd ALDRIG oklch eller oklab
3. ✅ Kör test före varje commit
4. ✅ Testet måste passera innan deployment

Detta är inte en rekommendation - det är ett **krav** för att applikationen ska fungera korrekt.
