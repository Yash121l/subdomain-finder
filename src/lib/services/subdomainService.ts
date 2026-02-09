/**
 * Subdomain discovery service using multiple OSINT sources
 * - crt.sh (Certificate Transparency logs)
 * - HackerTarget (DNS lookup)
 */

import type { CrtshEntry, OsintSource, SubdomainDiscovery } from '../../types/osint.types';
import { corsRequest } from './corsProxy';

/**
 * Extract unique subdomains from crt.sh Certificate Transparency data
 */
export async function queryCrtsh(
  domain: string,
  signal?: AbortSignal
): Promise<SubdomainDiscovery[]> {
  const url = `https://crt.sh/?q=%25.${encodeURIComponent(domain)}&output=json`;
  
  try {
    const data = await corsRequest<CrtshEntry[]>(url, { timeout: 30000 });
    
    if (signal?.aborted) return [];
    
    const subdomains = new Set<string>();
    
    for (const entry of data) {
      // Extract from name_value (can have multiple names separated by newlines)
      const names = entry.name_value.split('\n');
      for (const name of names) {
        const cleaned = name.trim().toLowerCase();
        // Skip wildcards and ensure it's a subdomain of target
        if (
          cleaned &&
          !cleaned.startsWith('*') &&
          cleaned.endsWith(`.${domain.toLowerCase()}`)
        ) {
          subdomains.add(cleaned);
        }
        // Also add exact matches
        if (cleaned === domain.toLowerCase()) {
          subdomains.add(cleaned);
        }
      }
      
      // Also check common_name
      const cn = entry.common_name.trim().toLowerCase();
      if (cn && !cn.startsWith('*') && cn.endsWith(`.${domain.toLowerCase()}`)) {
        subdomains.add(cn);
      }
    }
    
    const now = Date.now();
    return Array.from(subdomains).map((subdomain) => ({
      subdomain,
      source: 'crtsh' as OsintSource,
      discoveredAt: now,
    }));
  } catch (error) {
    console.error('crt.sh query failed:', error);
    return [];
  }
}

/**
 * Query HackerTarget for subdomains
 */
export async function queryHackerTarget(
  domain: string,
  signal?: AbortSignal
): Promise<SubdomainDiscovery[]> {
  const url = `https://api.hackertarget.com/hostsearch/?q=${encodeURIComponent(domain)}`;
  
  try {
    const text = await corsRequest<string>(url, { timeout: 15000, parseJson: false });
    
    if (signal?.aborted) return [];
    
    // Response format: subdomain,ip per line
    // May also return "API count exceeded" or "error" messages
    if (
      text.includes('API count exceeded') ||
      text.includes('error') ||
      text.includes('No DNS A records')
    ) {
      return [];
    }
    
    const subdomains = new Set<string>();
    const lines = text.split('\n');
    
    for (const line of lines) {
      const [subdomain] = line.split(',');
      if (subdomain && subdomain.includes('.')) {
        subdomains.add(subdomain.trim().toLowerCase());
      }
    }
    
    const now = Date.now();
    return Array.from(subdomains).map((subdomain) => ({
      subdomain,
      source: 'hackertarget' as OsintSource,
      discoveredAt: now,
    }));
  } catch (error) {
    console.error('HackerTarget query failed:', error);
    return [];
  }
}

/**
 * Discover subdomains from all sources
 */
export async function discoverSubdomains(
  domain: string,
  sources: OsintSource[] = ['all'],
  signal?: AbortSignal
): Promise<SubdomainDiscovery[]> {
  const shouldQueryAll = sources.includes('all');
  
  const queries: Promise<SubdomainDiscovery[]>[] = [];
  
  if (shouldQueryAll || sources.includes('crtsh')) {
    queries.push(queryCrtsh(domain, signal));
  }
  
  if (shouldQueryAll || sources.includes('hackertarget')) {
    queries.push(queryHackerTarget(domain, signal));
  }
  
  const results = await Promise.all(queries);
  
  if (signal?.aborted) return [];
  
  // Merge and deduplicate results
  const seenSubdomains = new Map<string, SubdomainDiscovery>();
  
  for (const discoveries of results) {
    for (const discovery of discoveries) {
      const key = discovery.subdomain.toLowerCase();
      if (!seenSubdomains.has(key)) {
        seenSubdomains.set(key, discovery);
      }
    }
  }
  
  return Array.from(seenSubdomains.values()).sort((a, b) =>
    a.subdomain.localeCompare(b.subdomain)
  );
}

/**
 * Stream subdomain discoveries with progress callbacks
 */
export async function streamSubdomainDiscovery(
  domain: string,
  sources: OsintSource[] = ['all'],
  callbacks: {
    onProgress?: (message: string) => void;
    onDiscovery?: (discoveries: SubdomainDiscovery[]) => void;
    onComplete?: () => void;
    onError?: (error: Error) => void;
  },
  signal?: AbortSignal
): Promise<void> {
  const { onProgress, onDiscovery, onComplete, onError } = callbacks;
  const shouldQueryAll = sources.includes('all');
  
  try {
    // Query crt.sh
    if (shouldQueryAll || sources.includes('crtsh')) {
      if (signal?.aborted) return;
      onProgress?.('Querying Certificate Transparency logs (crt.sh)...');
      
      const crtshResults = await queryCrtsh(domain, signal);
      
      if (signal?.aborted) return;
      if (crtshResults.length > 0) {
        onProgress?.(`Found ${crtshResults.length} subdomains from crt.sh`);
        onDiscovery?.(crtshResults);
      } else {
        onProgress?.('No results from crt.sh');
      }
    }
    
    // Query HackerTarget
    if (shouldQueryAll || sources.includes('hackertarget')) {
      if (signal?.aborted) return;
      onProgress?.('Querying HackerTarget DNS search...');
      
      const htResults = await queryHackerTarget(domain, signal);
      
      if (signal?.aborted) return;
      if (htResults.length > 0) {
        onProgress?.(`Found ${htResults.length} subdomains from HackerTarget`);
        onDiscovery?.(htResults);
      } else {
        onProgress?.('No additional results from HackerTarget');
      }
    }
    
    onComplete?.();
  } catch (error) {
    onError?.(error instanceof Error ? error : new Error(String(error)));
  }
}
