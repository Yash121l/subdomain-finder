import posthog from "posthog-js";

const APP_SLUG = "subdomain-finder";

const key = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
const host = (import.meta.env.VITE_POSTHOG_HOST as string | undefined) || "/ingest";
const enableInDev = import.meta.env.VITE_POSTHOG_ENABLE_DEV === "true";

let enabled = false;

function isLocalhost(): boolean {
  if (typeof window === "undefined") return true;
  const h = window.location.hostname;
  return h === "localhost" || h === "127.0.0.1" || h === "::1" || h === "[::1]";
}

export function initAnalytics(): void {
  if (enabled || !key) return;
  if (!enableInDev && (!import.meta.env.PROD || isLocalhost())) return;

  posthog.init(key, {
    api_host: host,
    ui_host: "https://us.posthog.com",
    defaults: "2026-08-30",
    capture_pageview: "history_change",
    capture_pageleave: true,
    autocapture: true,
    enable_heatmaps: true,
    capture_dead_clicks: true,
    capture_exceptions: true,
    capture_performance: { web_vitals: true },
    session_recording: { maskAllInputs: true },
    person_profiles: "identified_only",
  });
  posthog.register({ app: APP_SLUG });
  enabled = true;
}

export function track(event: string, properties?: Record<string, unknown>): void {
  if (!enabled) return;
  try {
    posthog.capture(event, properties);
  } catch {
    // analytics must never break the app
  }
}
