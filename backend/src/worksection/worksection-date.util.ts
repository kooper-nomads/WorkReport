// Worksection date_added has no timezone offset (e.g. '2026-09-19 13:37') — treated as local
// time of the Node process. See "Possible Timezone Mismatch in Period Filtering" in the vault.
export function parseWorksectionDate(dateAdded: string): number {
  return new Date(dateAdded.replace(' ', 'T')).getTime();
}

// Inverse of the above, for building search_tasks `filter=` date literals ('DD.MM.YYYY') —
// same local-time convention, so a round trip through parseWorksectionDate lines up.
export function formatWorksectionFilterDate(timestamp: number): string {
  const date = new Date(timestamp);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}.${month}.${date.getFullYear()}`;
}
