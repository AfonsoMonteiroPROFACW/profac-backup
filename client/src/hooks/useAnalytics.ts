import { useEffect, useRef } from "react";
import { useLocation } from "wouter";

export function useAnalytics() {
  const [location] = useLocation();
  const lastTracked = useRef<string>("");

  useEffect(() => {
    if (location === lastTracked.current) return;
    lastTracked.current = location;

    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: location,
          referrer: document.referrer || null,
        }),
        credentials: "include",
        signal: controller.signal,
      }).catch(() => {});
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [location]);
}
