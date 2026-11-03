/**
 * Universal date formatter to enforce the exact standard format: "Nov 04, 2026"
 * (3-letter month, 2-digit day with leading zero, 4-digit year)
 */
export function formatDisplayDate(dateInput: string | number | Date | undefined | null): string {
  if (!dateInput) return '';

  if (typeof dateInput === 'string') {
    const trimmed = dateInput.trim();

    // 1. ISO format: "2026-11-04" or "2026-11-04T09:00:00.000Z"
    const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
      const year = isoMatch[1];
      const monthIdx = parseInt(isoMatch[2], 10) - 1;
      const day = isoMatch[3].padStart(2, '0');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      if (monthIdx >= 0 && monthIdx < 12) {
        return `${months[monthIdx]} ${day}, ${year}`;
      }
    }

    // 2. Text formats like "Nov 4, 2026" or "Nov 04, 2026" or "November 4, 2026"
    const textMatch = trimmed.match(/^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})/);
    if (textMatch) {
      const rawMonth = textMatch[1].slice(0, 3);
      const month = rawMonth.charAt(0).toUpperCase() + rawMonth.slice(1, 3).toLowerCase();
      const day = textMatch[2].padStart(2, '0');
      const year = textMatch[3];
      return `${month} ${day}, ${year}`;
    }

    // 3. Slash formats like "11/04/2026" or "11/4/2026"
    const slashMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (slashMatch) {
      const monthIdx = parseInt(slashMatch[1], 10) - 1;
      const day = slashMatch[2].padStart(2, '0');
      const year = slashMatch[3];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      if (monthIdx >= 0 && monthIdx < 12) {
        return `${months[monthIdx]} ${day}, ${year}`;
      }
    }
  }

  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const day = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();
  return `${month} ${day}, ${year}`;
}
