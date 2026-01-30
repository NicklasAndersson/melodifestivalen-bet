export interface MelodiArtist {
  artist: string;
  song: string;
  heat: string;
  heatDate: string;
}

export const HEAT_DATES: Record<string, string> = {
  "Deltävling 1": "2026-01-31",
  "Deltävling 2": "2026-02-08",
  "Deltävling 3": "2026-02-15",
  "Deltävling 4": "2026-02-22",
  "Andra chansen": "2026-02-28",
  "Final": "2026-03-14",
};

export const MELODIFESTIVALEN_2026: MelodiArtist[] = [
  { artist: "Albin Lee Meldau", song: "En annan värld", heat: "Deltävling 1", heatDate: HEAT_DATES["Deltävling 1"] },
  { artist: "Amanda Aasa", song: "One more weekend", heat: "Deltävling 1", heatDate: HEAT_DATES["Deltävling 1"] },
  { artist: "Anis Don Demina", song: "No sleep", heat: "Deltävling 1", heatDate: HEAT_DATES["Deltävling 1"] },
  { artist: "Anton Ewald", song: "Are you gonna love me", heat: "Deltävling 1", heatDate: HEAT_DATES["Deltävling 1"] },
  { artist: "Chris Kläfford", song: "The way I do", heat: "Deltävling 1", heatDate: HEAT_DATES["Deltävling 1"] },
  { artist: "Dahlberg & Alkazar", song: "Rave into the future", heat: "Deltävling 1", heatDate: HEAT_DATES["Deltävling 1"] },
  { artist: "Gunilla Persson", song: "I won't shake (Lämna mig för fan ifred!)", heat: "Deltävling 1", heatDate: HEAT_DATES["Deltävling 1"] },
  
  { artist: "Alvaro Estrella", song: "Glow", heat: "Deltävling 2", heatDate: HEAT_DATES["Deltävling 2"] },
  { artist: "Danne Stråhed", song: "Made for loving you", heat: "Deltävling 2", heatDate: HEAT_DATES["Deltävling 2"] },
  { artist: "Ellinor Nilsson", song: "Grateful", heat: "Deltävling 2", heatDate: HEAT_DATES["Deltävling 2"] },
  { artist: "Kay Lande", song: "Aldrig ensam mer", heat: "Deltävling 2", heatDate: HEAT_DATES["Deltävling 2"] },
  { artist: "Maria Sur", song: "What am I", heat: "Deltävling 2", heatDate: HEAT_DATES["Deltävling 2"] },
  { artist: "Miss Li", song: "Tills jag dör", heat: "Deltävling 2", heatDate: HEAT_DATES["Deltävling 2"] },
  { artist: "Olivia Lobato", song: "Not your darling", heat: "Deltävling 2", heatDate: HEAT_DATES["Deltävling 2"] },
  
  { artist: "Arvingarna", song: "Vem", heat: "Deltävling 3", heatDate: HEAT_DATES["Deltävling 3"] },
  { artist: "Fröken Snusk", song: "En riktig schlager", heat: "Deltävling 3", heatDate: HEAT_DATES["Deltävling 3"] },
  { artist: "Jacqline", song: "Last minute", heat: "Deltävling 3", heatDate: HEAT_DATES["Deltävling 3"] },
  { artist: "Kaliffa", song: "One of us", heat: "Deltävling 3", heatDate: HEAT_DATES["Deltävling 3"] },
  { artist: "Kalle Johansson", song: "Alright", heat: "Deltävling 3", heatDate: HEAT_DATES["Deltävling 3"] },
  { artist: "Malte Stridh & Saga Woxlin", song: "Don't stop me now", heat: "Deltävling 3", heatDate: HEAT_DATES["Deltävling 3"] },
  { artist: "Nathan Fake", song: "Broken", heat: "Deltävling 3", heatDate: HEAT_DATES["Deltävling 3"] },
  
  { artist: "Cazzi Opeia", song: "Love Trigger", heat: "Deltävling 4", heatDate: HEAT_DATES["Deltävling 4"] },
  { artist: "Elov & Beny", song: "Om mitt liv var en film", heat: "Deltävling 4", heatDate: HEAT_DATES["Deltävling 4"] },
  { artist: "Klara Hammarström", song: "När vi var barn", heat: "Deltävling 4", heatDate: HEAT_DATES["Deltävling 4"] },
  { artist: "Medina", song: "In i dimman", heat: "Deltävling 4", heatDate: HEAT_DATES["Deltävling 4"] },
  { artist: "Peg Parnevik", song: "Little bit of love", heat: "Deltävling 4", heatDate: HEAT_DATES["Deltävling 4"] },
  { artist: "Robin Bengtsson", song: "You glow", heat: "Deltävling 4", heatDate: HEAT_DATES["Deltävling 4"] },
  { artist: "Sonja Aldén", song: "Call your name", heat: "Deltävling 4", heatDate: HEAT_DATES["Deltävling 4"] },
];

export function isVotingAllowed(heatDate: string): boolean {
  return true;
}

export function isHeatToday(heatDate: string): boolean {
  const heatDateTime = new Date(heatDate + 'T20:00:00');
  const today = new Date();
  
  return heatDateTime.toLocaleDateString('sv-SE', { timeZone: 'Europe/Stockholm' }) === 
         today.toLocaleDateString('sv-SE', { timeZone: 'Europe/Stockholm' });
}

export function getHeatCity(heat: string): string {
  const cities: Record<string, string> = {
    "Deltävling 1": "Linköping",
    "Deltävling 2": "Göteborg",
    "Deltävling 3": "Malmö",
    "Deltävling 4": "Örnsköldsvik",
    "Andra chansen": "Karlstad",
    "Final": "Stockholm",
  };
  return cities[heat] || "";
}

export function getHeatVenue(heat: string): string {
  const venues: Record<string, string> = {
    "Deltävling 1": "Saab Arena",
    "Deltävling 2": "Scandinavium",
    "Deltävling 3": "Malmö Arena",
    "Deltävling 4": "Fjällräven Center",
    "Andra chansen": "Löfbergs Arena",
    "Final": "Friends Arena",
  };
  return venues[heat] || "";
}

export function getVotingOpensDate(heatDate: string): Date {
  const heatDateTime = new Date(heatDate + 'T20:00:00').getTime();
  return new Date(heatDateTime - (24 * 60 * 60 * 1000));
}

export function getMellopediaUrl(text: string): string {
  const normalized = text
    .replace(/&/g, '%26')
    .replace(/\s+/g, '_')
    .replace(/å/g, 'å')
    .replace(/ä/g, 'ä')
    .replace(/ö/g, 'ö')
    .replace(/Å/g, 'Å')
    .replace(/Ä/g, 'Ä')
    .replace(/Ö/g, 'Ö');
  
  return `https://mellopedia.svt.se/index.php/${normalized}`;
}
