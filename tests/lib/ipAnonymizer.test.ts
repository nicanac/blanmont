import { describe, it, expect } from 'vitest';
import { anonymizeIp, extractClientIp } from '@/app/lib/logging/ipAnonymizer';

describe('ipAnonymizer', () => {
  it('masks the last octet of an IPv4 address', () => {
    expect(anonymizeIp('192.168.1.42')).toBe('192.168.1.xxx');
    expect(anonymizeIp('81.240.12.99')).toBe('81.240.12.xxx');
    expect(anonymizeIp('10.0.0.1')).toBe('10.0.0.xxx');
  });

  it('handles localhost IPv4 and IPv6 gracefully', () => {
    expect(anonymizeIp('127.0.0.1')).toBe('127.0.0.xxx');
    expect(anonymizeIp('localhost')).toBe('127.0.0.xxx');
    expect(anonymizeIp('::1')).toBe('::1 (local)');
  });

  it('masks IPv6 addresses keeping only network prefix', () => {
    const ipv6 = '2001:0db8:85a3:0000:0000:8a2e:0370:7334';
    const result = anonymizeIp(ipv6);
    expect(result).toBe('2001:0db8:85a3:xxxx:xxxx:xxxx:xxxx:xxxx');
  });

  it('handles comma-separated proxy headers', () => {
    expect(anonymizeIp('194.154.20.10, 10.0.0.1')).toBe('194.154.20.xxx');
  });

  it('handles null, undefined, and empty string safely', () => {
    expect(anonymizeIp(null)).toBe('0.0.0.xxx');
    expect(anonymizeIp(undefined)).toBe('0.0.0.xxx');
    expect(anonymizeIp('')).toBe('0.0.0.xxx');
  });

  it('extracts client IP from Headers object correctly', () => {
    const headers1 = new Headers({ 'x-forwarded-for': '198.51.100.22, 10.0.0.1' });
    expect(extractClientIp(headers1)).toBe('198.51.100.22');

    const headers2 = new Headers({ 'x-real-ip': '203.0.113.195' });
    expect(extractClientIp(headers2)).toBe('203.0.113.195');

    const headers3 = new Headers({ 'cf-connecting-ip': '198.51.100.77' });
    expect(extractClientIp(headers3)).toBe('198.51.100.77');

    const emptyHeaders = new Headers();
    expect(extractClientIp(emptyHeaders)).toBe('127.0.0.1');
  });
});
