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

  let isoDuration = 'P';

  if (days > 0) {
    isoDuration += `${days}D`;
  }

  if (hours > 0 || minutes > 0 || seconds > 0) {
    isoDuration += 'T';
  }

  if (hours > 0) {
    isoDuration += `${hours}H`;
  }

  if (minutes > 0) {
    isoDuration += `${minutes}M`;
  }

  if (seconds > 0 || (hours === 0 && minutes === 0 && days === 0)) {
    // Always include seconds, even if 0, unless there are higher units
    isoDuration += `${seconds}S`;
  }

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
  const iso8601Date = date.toISOString().replace('.000Z', '+00:00');
  return iso8601Date;
}
