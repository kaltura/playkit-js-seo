/**
 * @public
 * @param {string} durationInSeconds - duration in Seconds
 * @return {string} - The evaluated string
 */
export function convertDurationToISO8601(durationInSeconds: number): string {
  const seconds = Math.floor(durationInSeconds % 60);
  const minutes = Math.floor((durationInSeconds / 60) % 60);
  const hours = Math.floor((durationInSeconds / (60 * 60)) % 24);
  const days = Math.floor(durationInSeconds / (60 * 60 * 24));

  const paddedHours = hours.toString().padStart(2, '0');
  const paddedMinutes = minutes.toString().padStart(2, '0');

  const isoDuration = `P${days || ''}DT${paddedHours}H${paddedMinutes}M${seconds}S`;
  return isoDuration;
}

/**
 * @public
 * @param {string} unixTimestamp - date in Unix timestamp format
 * @return {string} - The evaluated string in ISO 8601 format without the UTC offset
 */
export function convertUnixTimestampToISO8601(unixTimestamp: number): string {
  const milliseconds = unixTimestamp * 1000;
  const date = new Date(milliseconds);
  // const timezoneOffset = date.getTimezoneOffset();
  // const timeSubtractedTimezone = date.getTime() - timezoneOffset * 60 * 1000;
  // const newDate = new Date(timeSubtractedTimezone);
  // const iso8601Date = newDate.toISOString().replace('.000Z', '+00:00');
  const iso8601Date = date.toISOString().replace('.000Z', '+00:00');
  return iso8601Date;
}
