import { DESK_TIMEZONE } from './config';

/**
 * Format time using DESK_TIMEZONE (Asia/Karachi) with Intl.DateTimeFormat.
 * Strictly guarantees no 'GMT' string appears in output.
 */
export function formatTimeInDeskZone(date: Date | string | number): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';

  return new Intl.DateTimeFormat('en-US', {
    timeZone: DESK_TIMEZONE,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(d);
}

/**
 * Format slot label and add date prefix when the slot is on a different day than reference date (default today).
 */
export function formatSlotHeader(slotTimeStr: string, referenceDate: Date = new Date()): string {
  if (!slotTimeStr) return '';

  // If slotTimeStr is already just a time like "9:00 AM" or "10:00 AM"
  if (/^\d{1,2}:\d{2}\s*(?:AM|PM)$/i.test(slotTimeStr.trim())) {
    return slotTimeStr.trim().toUpperCase();
  }

  const d = new Date(slotTimeStr);
  if (isNaN(d.getTime())) {
    return slotTimeStr;
  }

  // Check if same calendar day in Asia/Karachi
  const slotDateFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: DESK_TIMEZONE,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });

  const slotDay = slotDateFormatter.format(d);
  const refDay = slotDateFormatter.format(referenceDate);

  const timePart = formatTimeInDeskZone(d);

  if (slotDay !== refDay) {
    const monthDayPart = new Intl.DateTimeFormat('en-US', {
      timeZone: DESK_TIMEZONE,
      month: 'short',
      day: 'numeric',
    }).format(d);
    return `${monthDayPart}, ${timePart}`;
  }

  return timePart;
}

/**
 * Format full date and time for timestamps (e.g., job submission).
 */
export function formatDateTimeInDeskZone(date: Date | string | number): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';

  return new Intl.DateTimeFormat('en-US', {
    timeZone: DESK_TIMEZONE,
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(d);
}
