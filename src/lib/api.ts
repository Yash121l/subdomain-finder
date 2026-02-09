const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8787";

type ApiResponse<T> = {
  data?: T;
  error?: string;
};

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem("auth_token");
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem("auth_token", token);
    } else {
      localStorage.removeItem("auth_token");
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...options.headers as Record<string, string>,
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || "Request failed" };
      }

      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Network error" };
    }
  }

  // Auth endpoints
  async register(email: string, password: string) {
    return this.request<{ token: string; user: { id: string; email: string } }>(
      "/api/auth/register",
      { method: "POST", body: JSON.stringify({ email, password }) }
    );
  }

  async login(email: string, password: string) {
    return this.request<{ token: string; user: { id: string; email: string } }>(
      "/api/auth/login",
      { method: "POST", body: JSON.stringify({ email, password }) }
    );
  }

  async getMe() {
    return this.request<{ user: { id: string; email: string; created_at: string } }>(
      "/api/auth/me"
    );
  }

  // Scans endpoints
  async getScans() {
    return this.request<{ scans: Array<{
      id: string;
      domain: string;
      status: string;
      total_found: number;
      total_resolved: number;
      created_at: string;
    }> }>("/api/scans");
  }

  async createScan(domain: string, sources: string = "all") {
    return this.request<{ scan: { id: string; domain: string; status: string } }>(
      "/api/scans",
      { method: "POST", body: JSON.stringify({ domain, sources }) }
    );
  }

  async getScan(id: string) {
    return this.request<{
      scan: {
        id: string;
        domain: string;
        status: string;
        total_found: number;
        total_resolved: number;
        created_at: string;
        completed_at: string | null;
      };
      results: Array<{
        id: string;
        subdomain: string;
        ip_addresses: string;
        source: string;
        resolved: number;
      }>;
    }>(`/api/scans/${id}`);
  }

  async updateScan(id: string, data: { status?: string; total_found?: number; total_resolved?: number }) {
    return this.request<{ success: boolean }>(
      `/api/scans/${id}`,
      { method: "PATCH", body: JSON.stringify(data) }
    );
  }

  async addScanResults(scanId: string, results: Array<{
    subdomain: string;
    ip_addresses?: string[];
    source: string;
    resolved?: boolean;
  }>) {
    return this.request<{ success: boolean; count: number }>(
      `/api/scans/${scanId}/results`,
      { method: "POST", body: JSON.stringify({ results }) }
    );
  }

  async deleteScan(id: string) {
    return this.request<{ success: boolean }>(
      `/api/scans/${id}`,
      { method: "DELETE" }
    );
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
