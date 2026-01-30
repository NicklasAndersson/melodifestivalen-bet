export interface MelodiArtist {
  number: number;
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
  { number: 1, artist: "Greczula", song: "Half of Me", heat: "Deltävling 1", heatDate: HEAT_DATES["Deltävling 1"] },
  { number: 2, artist: "Jacqline", song: "Starkare", heat: "Deltävling 1", heatDate: HEAT_DATES["Deltävling 1"] },
  { number: 3, artist: "Scarlet", song: "Photographs", heat: "Deltävling 1", heatDate: HEAT_DATES["Deltävling 1"] },
  { number: 4, artist: "Rake", song: "Spela upp", heat: "Deltävling 1", heatDate: HEAT_DATES["Deltävling 1"] },
  { number: 5, artist: "Sonia", song: "Le Freak", heat: "Deltävling 1", heatDate: HEAT_DATES["Deltävling 1"] },
  { number: 6, artist: "Mr. Pimp Music", song: "Heja Sverige", heat: "Deltävling 1", heatDate: HEAT_DATES["Deltävling 1"] },
  { number: 7, artist: "Willjam", song: "Aldrig ensam", heat: "Deltävling 1", heatDate: HEAT_DATES["Deltävling 1"] },
  
  { number: 1, artist: "Andreas Halldén", song: "Hearts Go First", heat: "Deltävling 2", heatDate: HEAT_DATES["Deltävling 2"] },
  { number: 2, artist: "Colaboyz", song: "Leva livet", heat: "Deltävling 2", heatDate: HEAT_DATES["Deltävling 2"] },
  { number: 3, artist: "Emilléa", song: "Svart å vitt", heat: "Deltävling 2", heatDate: HEAT_DATES["Deltävling 2"] },
  { number: 4, artist: "Irene Kärnebro", song: "Beautiful Stranger", heat: "Deltävling 2", heatDate: HEAT_DATES["Deltävling 2"] },
  { number: 5, artist: "Janne Bark", song: "Alla vi som rör oss", heat: "Deltävling 2", heatDate: HEAT_DATES["Deltävling 2"] },
  { number: 6, artist: "Medina", song: "Utan strid", heat: "Deltävling 2", heatDate: HEAT_DATES["Deltävling 2"] },
  { number: 7, artist: "Robert Skog", song: "Tycka om", heat: "Deltävling 2", heatDate: HEAT_DATES["Deltävling 2"] },
  
  { number: 1, artist: "The Boppers & Tess Merkel", song: "Vacker värld (Come On Get Happy)", heat: "Deltävling 3", heatDate: HEAT_DATES["Deltävling 3"] },
  { number: 2, artist: "Carsten Lindberg", song: "Kom och vänd det upp och ner", heat: "Deltävling 3", heatDate: HEAT_DATES["Deltävling 3"] },
  { number: 3, artist: "Deliah", song: "Hush Hush", heat: "Deltävling 3", heatDate: HEAT_DATES["Deltävling 3"] },
  { number: 4, artist: "Eva Eastwood", song: "Man blir mä världen", heat: "Deltävling 3", heatDate: HEAT_DATES["Deltävling 3"] },
  { number: 5, artist: "Hanna Hedlund", song: "Vinden vänder", heat: "Deltävling 3", heatDate: HEAT_DATES["Deltävling 3"] },
  { number: 6, artist: "Lancelot", song: "När tiden står stilla", heat: "Deltävling 3", heatDate: HEAT_DATES["Deltävling 3"] },
  { number: 7, artist: "Lovad", song: "Ingen som jag vill ha", heat: "Deltävling 3", heatDate: HEAT_DATES["Deltävling 3"] },
  
  { number: 1, artist: "Bror Gunnar Jansson", song: "Allt ligger bakom oss", heat: "Deltävling 4", heatDate: HEAT_DATES["Deltävling 4"] },
  { number: 2, artist: "Conny Bloom", song: "Det jag ger", heat: "Deltävling 4", heatDate: HEAT_DATES["Deltävling 4"] },
  { number: 3, artist: "Frida Öhrn", song: "Dansa dansa", heat: "Deltävling 4", heatDate: HEAT_DATES["Deltävling 4"] },
  { number: 4, artist: "LŪ LŪ", song: "Down Low", heat: "Deltävling 4", heatDate: HEAT_DATES["Deltävling 4"] },
  { number: 5, artist: "Nöd & lust", song: "Oh mammy", heat: "Deltävling 4", heatDate: HEAT_DATES["Deltävling 4"] },
  { number: 6, artist: "Showan", song: "Hål i gardinen", heat: "Deltävling 4", heatDate: HEAT_DATES["Deltävling 4"] },
  { number: 7, artist: "Tenori", song: "Vilken dag!", heat: "Deltävling 4", heatDate: HEAT_DATES["Deltävling 4"] },
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
