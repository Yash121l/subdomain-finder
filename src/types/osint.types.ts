export type OsintSource = 'crtsh' | 'hackertarget' | 'all';

export type CrtshEntry = {
  issuer_ca_id: number;
  issuer_name: string;
  common_name: string;
  name_value: string;
  id: number;
  entry_timestamp: string;
  not_before: string;
  not_after: string;
  serial_number: string;
};

export type DnsRecord = {
  type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS';
  value: string;
  ttl?: number;
};

export type SubdomainDiscovery = {
  subdomain: string;
  source: OsintSource;
  discoveredAt: number;
};

export type DnsLookupResult = {
  subdomain: string;
  records: DnsRecord[];
  ipAddresses: string[];
  resolved: boolean;
};

export type HttpProbeResult = {
  subdomain: string;
  statusCode: number | null;
  responseTime: number | null;
  https: boolean;
  title?: string;
  server?: string;
  error?: string;
};

export type ScanConfig = {
  domain: string;
  sources: OsintSource[];
  resolveDns: boolean;
  probeHttp: boolean;
  concurrency: number;
  timeout: number;
};
