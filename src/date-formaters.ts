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

  // Create a new Date object with the provided Unix timestamp
  const date = new Date(milliseconds);

  // Get the current timezone offset in minutes
  const timezoneOffset = date.getTimezoneOffset();

  // Calculate the new time value by subtracting the timezone offset
  const newTimeValue = date.getTime() - timezoneOffset * 60 * 1000;

  // Create a new Date object with the updated time value
  const newDate = new Date(newTimeValue);

  // Convert the new date to ISO 8601 format
  const iso8601Date = newDate.toISOString().replace('.000Z', '+00:00');

  return iso8601Date;
}
