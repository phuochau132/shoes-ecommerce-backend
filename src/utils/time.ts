export function parseExpirationTime(expirationTime: string = '15m'): number {
  const regex = /(\d+)([mhd])/;
  const match = expirationTime.match(regex);

  if (!match) {
    throw new Error('Invalid expiration time format');
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 'm':
      return value * 60;
    case 'h':
      return value * 60 * 60;
    case 'd':
      return value * 24 * 60 * 60;
    default:
      throw new Error('Unsupported unit');
  }
}
