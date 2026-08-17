import { useCallback, useEffect, useState } from "react";
import { loadHouse, type HouseBundle } from "@/lib/server/house";

export function useHouse() {
  const [bundle, setBundle] = useState<HouseBundle | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const result = await loadHouse();
    setBundle(result.ok ? result.house : null);
    setReady(true);
  }, []);

  useEffect(() => {
    refresh().catch((err) => {
      setError(err instanceof Error ? err.message : "Could not load the house");
      setReady(true);
    });
  }, [refresh]);

  return { bundle, ready, error, refresh, setBundle };
}
