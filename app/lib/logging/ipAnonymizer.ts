/**
 * IP Anonymization Utility for GDPR compliance.
 * Protects user privacy while retaining high-level origin diagnostics.
 */

/**
 * Anonymizes an IPv4 or IPv6 address by masking identifying octets.
 *
 * @param ip - Raw IP address string.
 * @returns Anonymized IP string, or 'anonymous' if invalid/missing.
 */
export function anonymizeIp(ip?: string | null): string {
  if (!ip || typeof ip !== 'string') {
    return '0.0.0.xxx';
  }

  const trimmed = ip.trim();

  // If comma-separated (e.g. from x-forwarded-for: "client, proxy1, proxy2"), take the first
  const firstIp = trimmed.split(',')[0].trim();

  // Handle localhost
  if (firstIp === '127.0.0.1' || firstIp === 'localhost') {
    return '127.0.0.xxx';
  }
  if (firstIp === '::1' || firstIp === '::ffff:127.0.0.1') {
    return '::1 (local)';
  }

  // IPv4 mapped IPv6 (e.g. ::ffff:192.168.1.1)
  if (firstIp.startsWith('::ffff:')) {
    const ipv4Part = firstIp.replace('::ffff:', '');
    return `::ffff:${anonymizeIpv4(ipv4Part)}`;
  }

  // IPv4 standard format (x.x.x.x)
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(firstIp)) {
    return anonymizeIpv4(firstIp);
  }

  // IPv6 format (contains :)
  if (firstIp.includes(':')) {
    return anonymizeIpv6(firstIp);
  }

  return 'unknown';
}

function anonymizeIpv4(ipv4: string): string {
  const parts = ipv4.split('.');
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
  }
  return '0.0.0.xxx';
}

function anonymizeIpv6(ipv6: string): string {
  const parts = ipv6.split(':');
  if (parts.length >= 3) {
    // Keep first 3 segments (network prefix), mask the rest
    return `${parts[0]}:${parts[1]}:${parts[2]}:xxxx:xxxx:xxxx:xxxx:xxxx`;
  }
  return 'xxxx:xxxx:xxxx::';
}

/**
 * Extracts raw client IP from request headers or standard Next.js request.
 */
export function extractClientIp(headers: Headers): string {
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  const cfConnectingIp = headers.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp.trim();
  }

  return '127.0.0.1';
}
