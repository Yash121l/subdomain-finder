const DOH_PRIMARY = "https://1.1.1.1/dns-query";
const DOH_FALLBACK = "https://cloudflare-dns.com/dns-query";

type DnsResponse = {
  Status: number;
  Answer?: { data: string; type: number }[];
};

async function queryDoH(name: string, type: number, signal?: AbortSignal): Promise<string[]> {
  const params = new URLSearchParams({ name, type: String(type) });

  for (const endpoint of [DOH_PRIMARY, DOH_FALLBACK]) {
    try {
      const res = await fetch(`${endpoint}?${params}`, {
        headers: { Accept: "application/dns-json" },
        signal,
      });
      if (!res.ok) continue;

      const data: DnsResponse = await res.json();
      if (data.Status !== 0 || !data.Answer) return [];
      return data.Answer.filter((a) => a.type === type).map((a) => a.data.trim());
    } catch {
      // try fallback
    }
  }
  return [];
}

export async function resolveIPs(domain: string, timeoutMs = 5000): Promise<string[]> {
  const signal = AbortSignal.timeout(timeoutMs);
  const [aRecords, aaaaRecords] = await Promise.allSettled([
    queryDoH(domain, 1, signal),  // A
    queryDoH(domain, 28, signal), // AAAA
  ]);

  const ips: string[] = [];
  if (aRecords.status === "fulfilled") ips.push(...aRecords.value);
  if (aaaaRecords.status === "fulfilled") ips.push(...aaaaRecords.value);
  return ips;
}

export async function batchResolve(
  domains: string[],
  concurrency = 10,
  signal?: AbortSignal,
  timeoutMs = 5000
): Promise<Map<string, string[]>> {
  const result = new Map<string, string[]>();
  const queue = [...domains];

  const worker = async () => {
    while (queue.length > 0) {
      if (signal?.aborted) break;
      const domain = queue.shift();
      if (!domain) break;
      try {
        const ips = await resolveIPs(domain, timeoutMs);
        result.set(domain, ips);
      } catch {
        result.set(domain, []);
      }
    }
  };

  await Promise.all(
    Array(Math.min(concurrency, domains.length))
      .fill(null)
      .map(() => worker())
  );

  return result;
}
