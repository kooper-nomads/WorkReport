// Worksection date_added has no timezone offset (e.g. '2026-09-19 13:37') — treated as local
// time of the Node process. See "Possible Timezone Mismatch in Period Filtering" in the vault.
export function parseWorksectionDate(dateAdded: string): number {
  return new Date(dateAdded.replace(' ', 'T')).getTime();
}
