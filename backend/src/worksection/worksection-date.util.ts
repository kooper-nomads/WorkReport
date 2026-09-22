// Worksection date_added has no timezone offset (e.g. '2026-09-19 13:37') — treated as local
// time of the Node process. See "Possible Timezone Mismatch in Period Filtering" in the vault.
export function formatWorksectionFilterDate(timestamp: number): string {
  const date = new Date(timestamp);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}.${month}.${date.getFullYear()}`;
}
