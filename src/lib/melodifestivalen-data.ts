export interface MelodiArtist {
  number: number;
  artist: string;
  song: string;
  heat: string;
  heatDate: string;
}

export const HEAT_DATES: Record<string, string> = {
  "Deltävling 1": "2026-01-31",
  "Deltävling 2": "2026-02-07",
  "Deltävling 3": "2026-02-14",
  "Deltävling 4": "2026-02-21",
  "Deltävling 5": "2026-02-28",
  "Andra chansen": "2026-03-07",
  "Final": "2026-03-14",
};

export const MELODIFESTIVALEN_2026: MelodiArtist[] = [
  { number: 1, artist: "Greczula", song: "Half of Me", heat: "Deltävling 1", heatDate: HEAT_DATES["Deltävling 1"] },
  { number: 2, artist: "Jacqline", song: "Woman", heat: "Deltävling 1", heatDate: HEAT_DATES["Deltävling 1"] },
  { number: 3, artist: "noll2", song: "Berusade ord", heat: "Deltävling 1", heatDate: HEAT_DATES["Deltävling 1"] },
  { number: 4, artist: "Junior Lerin", song: "Copacabana Boy", heat: "Deltävling 1", heatDate: HEAT_DATES["Deltävling 1"] },
  { number: 5, artist: "Indra", song: "Beautiful Lie", heat: "Deltävling 1", heatDate: HEAT_DATES["Deltävling 1"] },
  { number: 6, artist: "A*Teens", song: "Iconic", heat: "Deltävling 1", heatDate: HEAT_DATES["Deltävling 1"] },
  
  { number: 1, artist: "Arwin", song: "Glitter", heat: "Deltävling 2", heatDate: HEAT_DATES["Deltävling 2"] },
  { number: 2, artist: "Laila Adèle", song: "Oxygen", heat: "Deltävling 2", heatDate: HEAT_DATES["Deltävling 2"] },
  { number: 3, artist: "Robin Bengtsson", song: "Honey Honey", heat: "Deltävling 2", heatDate: HEAT_DATES["Deltävling 2"] },
  { number: 4, artist: "FELICIA", song: "My System", heat: "Deltävling 2", heatDate: HEAT_DATES["Deltävling 2"] },
  { number: 5, artist: "Klara Almström", song: "Där hela världen väntar", heat: "Deltävling 2", heatDate: HEAT_DATES["Deltävling 2"] },
  { number: 6, artist: "Brandsta City Släckers", song: "Rakt in i elden", heat: "Deltävling 2", heatDate: HEAT_DATES["Deltävling 2"] },
  
  { number: 1, artist: "Patrik Jean", song: "Dusk Till Dawn", heat: "Deltävling 3", heatDate: HEAT_DATES["Deltävling 3"] },
  { number: 2, artist: "Korslagda", song: "King of Rock 'n' Roll", heat: "Deltävling 3", heatDate: HEAT_DATES["Deltävling 3"] },
  { number: 3, artist: "Emilia Pantić", song: "Ingenting", heat: "Deltävling 3", heatDate: HEAT_DATES["Deltävling 3"] },
  { number: 4, artist: "Medina", song: "Viva L'Amor", heat: "Deltävling 3", heatDate: HEAT_DATES["Deltävling 3"] },
  { number: 5, artist: "Eva Jumatate", song: "Selfish", heat: "Deltävling 3", heatDate: HEAT_DATES["Deltävling 3"] },
  { number: 6, artist: "Saga Ludvigsson", song: "Ain't Today", heat: "Deltävling 3", heatDate: HEAT_DATES["Deltävling 3"] },
  
  { number: 1, artist: "Cimberly", song: "Eternity", heat: "Deltävling 4", heatDate: HEAT_DATES["Deltävling 4"] },
  { number: 2, artist: "Timo Räisänen", song: "Ingenting är efter oss", heat: "Deltävling 4", heatDate: HEAT_DATES["Deltävling 4"] },
  { number: 3, artist: "Meira Omar", song: "Dooset Daram", heat: "Deltävling 4", heatDate: HEAT_DATES["Deltävling 4"] },
  { number: 4, artist: "Felix Manu", song: "Hatar att jag älskar dig", heat: "Deltävling 4", heatDate: HEAT_DATES["Deltävling 4"] },
  { number: 5, artist: "Erika Jonsson", song: "Från landet", heat: "Deltävling 4", heatDate: HEAT_DATES["Deltävling 4"] },
  { number: 6, artist: "Smash Into Pieces", song: "Hollow", heat: "Deltävling 4", heatDate: HEAT_DATES["Deltävling 4"] },
  
  { number: 1, artist: "AleXa", song: "Tongue Tied", heat: "Deltävling 5", heatDate: HEAT_DATES["Deltävling 5"] },
  { number: 2, artist: "JULIETT", song: "Långt från alla andra", heat: "Deltävling 5", heatDate: HEAT_DATES["Deltävling 5"] },
  { number: 3, artist: "Bladë", song: "Who You Are", heat: "Deltävling 5", heatDate: HEAT_DATES["Deltävling 5"] },
  { number: 4, artist: "Lilla Al-Fadji", song: "Delulu", heat: "Deltävling 5", heatDate: HEAT_DATES["Deltävling 5"] },
  { number: 5, artist: "Vilhelm Buchaus", song: "Hearts Don't Lie", heat: "Deltävling 5", heatDate: HEAT_DATES["Deltävling 5"] },
  { number: 6, artist: "Sanna Nielsen", song: "Waste Your Love", heat: "Deltävling 5", heatDate: HEAT_DATES["Deltävling 5"] },
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
    "Deltävling 3": "Kristianstad",
    "Deltävling 4": "Malmö",
    "Deltävling 5": "Sundsvall",
    "Andra chansen": "Stockholm",
    "Final": "Stockholm",
  };
  return cities[heat] || "";
}

export function getHeatVenue(heat: string): string {
  const venues: Record<string, string> = {
    "Deltävling 1": "Saab Arena",
    "Deltävling 2": "Scandinavium",
    "Deltävling 3": "Kristianstad Arena",
    "Deltävling 4": "Malmö Arena",
    "Deltävling 5": "Gärdehov Arena",
    "Andra chansen": "Strawberry Arena",
    "Final": "Strawberry Arena",
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

export interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
}

export function getTimeUntilHeat(heatDate: string): TimeRemaining {
  const heatDateTime = new Date(heatDate + 'T20:00:00').getTime();
  const now = Date.now();
  const diff = heatDateTime - now;
  
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 };
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return { days, hours, minutes, seconds, totalMs: diff };
}
