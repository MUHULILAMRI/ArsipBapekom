const DIVISION_FOLDER_MAP: Record<string, string> = {
  KEUANGAN: "Divisi Keuangan",
  PENYELENGGARA: "Divisi Penyelenggara",
  TATA_USAHA: "Divisi Tata Usaha",
  UMUM: "Divisi Umum",
};

export function getDivisionFolderName(division: string): string {
  return DIVISION_FOLDER_MAP[division] || division;
}

export function getDivisionFromFolder(folderName: string): string | null {
  const entry = Object.entries(DIVISION_FOLDER_MAP).find(
    ([, v]) => v === folderName
  );
  return entry ? entry[0] : null;
}

export function getAllDivisions() {
  return Object.entries(DIVISION_FOLDER_MAP).map(([key, label]) => ({
    value: key,
    label,
  }));
}
