export interface MelodiArtist {
  artist: string;
  song: string;
  heat: string;
  heatDate: string;
}

export const HEAT_DATES: Record<string, string> = {
  "Deltävling 1": "2026-02-01",
  "Deltävling 2": "2026-02-08",
  "Deltävling 3": "2026-02-15",
  "Deltävling 4": "2026-02-22",
  "Andra chansen": "2026-02-28",
  "Final": "2026-03-14",
};

export const MELODIFESTIVALEN_2026: MelodiArtist[] = [
  { artist: "Albin Lee Meldau", song: "TBA", heat: "Deltävling 1", heatDate: HEAT_DATES["Deltävling 1"] },
  { artist: "Amanda Aasa", song: "TBA", heat: "Deltävling 1", heatDate: HEAT_DATES["Deltävling 1"] },
  { artist: "Anis Don Demina", song: "TBA", heat: "Deltävling 1", heatDate: HEAT_DATES["Deltävling 1"] },
  { artist: "Anton Ewald", song: "TBA", heat: "Deltävling 1", heatDate: HEAT_DATES["Deltävling 1"] },
  { artist: "Chris Kläfford", song: "TBA", heat: "Deltävling 1", heatDate: HEAT_DATES["Deltävling 1"] },
  { artist: "Dahlberg & Alkazar", song: "TBA", heat: "Deltävling 1", heatDate: HEAT_DATES["Deltävling 1"] },
  { artist: "Gunilla Persson", song: "TBA", heat: "Deltävling 1", heatDate: HEAT_DATES["Deltävling 1"] },
  
  { artist: "Alvaro Estrella", song: "TBA", heat: "Deltävling 2", heatDate: HEAT_DATES["Deltävling 2"] },
  { artist: "Danne Stråhed", song: "TBA", heat: "Deltävling 2", heatDate: HEAT_DATES["Deltävling 2"] },
  { artist: "Ellinor Nilsson", song: "TBA", heat: "Deltävling 2", heatDate: HEAT_DATES["Deltävling 2"] },
  { artist: "Kay Lande", song: "TBA", heat: "Deltävling 2", heatDate: HEAT_DATES["Deltävling 2"] },
  { artist: "Maria Sur", song: "TBA", heat: "Deltävling 2", heatDate: HEAT_DATES["Deltävling 2"] },
  { artist: "Miss Li", song: "TBA", heat: "Deltävling 2", heatDate: HEAT_DATES["Deltävling 2"] },
  { artist: "Olivia Lobato", song: "TBA", heat: "Deltävling 2", heatDate: HEAT_DATES["Deltävling 2"] },
  
  { artist: "Arvingarna", song: "TBA", heat: "Deltävling 3", heatDate: HEAT_DATES["Deltävling 3"] },
  { artist: "Fröken Snusk", song: "TBA", heat: "Deltävling 3", heatDate: HEAT_DATES["Deltävling 3"] },
  { artist: "Jacqline", song: "TBA", heat: "Deltävling 3", heatDate: HEAT_DATES["Deltävling 3"] },
  { artist: "Kaliffa", song: "TBA", heat: "Deltävling 3", heatDate: HEAT_DATES["Deltävling 3"] },
  { artist: "Kalle Johansson", song: "TBA", heat: "Deltävling 3", heatDate: HEAT_DATES["Deltävling 3"] },
  { artist: "Malte Stridh & Saga Woxlin", song: "TBA", heat: "Deltävling 3", heatDate: HEAT_DATES["Deltävling 3"] },
  { artist: "Nathan Fake", song: "TBA", heat: "Deltävling 3", heatDate: HEAT_DATES["Deltävling 3"] },
  
  { artist: "Cazzi Opeia", song: "TBA", heat: "Deltävling 4", heatDate: HEAT_DATES["Deltävling 4"] },
  { artist: "Elov & Beny", song: "TBA", heat: "Deltävling 4", heatDate: HEAT_DATES["Deltävling 4"] },
  { artist: "Klara Hammarström", song: "TBA", heat: "Deltävling 4", heatDate: HEAT_DATES["Deltävling 4"] },
  { artist: "Medina", song: "TBA", heat: "Deltävling 4", heatDate: HEAT_DATES["Deltävling 4"] },
  { artist: "Peg Parnevik", song: "TBA", heat: "Deltävling 4", heatDate: HEAT_DATES["Deltävling 4"] },
  { artist: "Robin Bengtsson", song: "TBA", heat: "Deltävling 4", heatDate: HEAT_DATES["Deltävling 4"] },
  { artist: "Sonja Aldén", song: "TBA", heat: "Deltävling 4", heatDate: HEAT_DATES["Deltävling 4"] },
];

export function isVotingAllowed(heatDate: string): boolean {
  const heatDateTime = new Date(heatDate).getTime();
  const oneDayBefore = heatDateTime - (24 * 60 * 60 * 1000);
  const now = Date.now();
  
  return now >= oneDayBefore;
}

export function getVotingOpensDate(heatDate: string): Date {
  const heatDateTime = new Date(heatDate).getTime();
  return new Date(heatDateTime - (24 * 60 * 60 * 1000));
}
