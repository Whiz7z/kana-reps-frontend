export function normRomaji(s: string) {
  return s.trim().toLowerCase();
}

export function normRomajiLenient(s: string) {
  return s
    .trim()
    .toLowerCase()
    .replace(/[āâ]/g, "aa")
    .replace(/[īî]/g, "ii")
    .replace(/[ūû]/g, "uu")
    .replace(/[ēê]/g, "ee")
    .replace(/[ōô]/g, "ou")
    .replace(/\s+/g, "");
}
