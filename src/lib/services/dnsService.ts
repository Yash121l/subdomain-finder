/**
 * DNS-over-HTTPS (DoH) service for DNS resolution from the browser
 * Uses Cloudflare and Google DoH endpoints
 */

import type { DnsRecord } from '../../types/osint.types';

const DOH_ENDPOINTS = {
  cloudflare: 'https://cloudflare-dns.com/dns-query',
  google: 'https://dns.google/resolve',
};

type DohResponse = {
  Status: number;
  Answer?: Array<{
    name: string;
    type: number;
    TTL: number;
    data: string;
  }>;
};

const DNS_TYPES: Record<number, DnsRecord['type']> = {
  1: 'A',
  28: 'AAAA',
  5: 'CNAME',
  15: 'MX',
  16: 'TXT',
  2: 'NS',
};

const DNS_TYPE_CODES: Record<string, number> = {
  A: 1,
  AAAA: 28,
  CNAME: 5,
  MX: 15,
  TXT: 16,
  NS: 2,
};

/**
 * Resolve DNS records for a domain using DoH
 */
export async function resolveDns(
  domain: string,
  recordType: DnsRecord['type'] = 'A',
  timeout = 5000
): Promise<DnsRecord[]> {
  const typeCode = DNS_TYPE_CODES[recordType];
  
  // Try Cloudflare first
  try {
    const records = await queryDoH(DOH_ENDPOINTS.cloudflare, domain, typeCode, timeout);
    if (records.length > 0) return records;
  } catch {
    // Fall through to Google
  }
  
  // Fallback to Google
  try {
    return await queryDoH(DOH_ENDPOINTS.google, domain, typeCode, timeout);
  } catch {
    return [];
  }
}

async function queryDoH(
  endpoint: string,
  domain: string,
  type: number,
  timeout: number
): Promise<DnsRecord[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const url = `${endpoint}?name=${encodeURIComponent(domain)}&type=${type}`;
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/dns-json',
      },
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) return [];
    
    const data: DohResponse = await response.json();
    
    if (data.Status !== 0 || !data.Answer) return [];
    
    return data.Answer.map((answer) => ({
      type: DNS_TYPES[answer.type] || 'A',
      value: answer.data.replace(/^"|"$/g, ''), // Remove quotes from TXT records
      ttl: answer.TTL,
    }));
  } catch {
    clearTimeout(timeoutId);
    return [];
  }
}

/**
 * Get all IP addresses for a domain
 */
export async function resolveIPs(domain: string, timeout = 5000): Promise<string[]> {
  const [aRecords, aaaaRecords] = await Promise.all([
    resolveDns(domain, 'A', timeout),
    resolveDns(domain, 'AAAA', timeout),
  ]);
  
  const ips: string[] = [];
  
  for (const record of aRecords) {
    if (record.type === 'A') ips.push(record.value);
  }
  
  for (const record of aaaaRecords) {
    if (record.type === 'AAAA') ips.push(record.value);
  }
  
  return ips;
}

/**
 * Check if a subdomain resolves (has any DNS records)
 */
export async function isResolvable(domain: string, timeout = 3000): Promise<boolean> {
  const records = await resolveDns(domain, 'A', timeout);
  return records.length > 0;
}

/**
 * Batch resolve multiple domains with concurrency control
 */
export async function batchResolve(
  domains: string[],
  concurrency = 10,
  timeout = 3000
): Promise<Map<string, string[]>> {
  const results = new Map<string, string[]>();
  const queue = [...domains];
  
  const worker = async () => {
    while (queue.length > 0) {
      const domain = queue.shift();
      if (!domain) break;
      
      const ips = await resolveIPs(domain, timeout);
      results.set(domain, ips);
    }
  };
  
  const workers = Array(Math.min(concurrency, domains.length))
    .fill(null)
    .map(() => worker());
  
  await Promise.all(workers);
  
  return results;
}
