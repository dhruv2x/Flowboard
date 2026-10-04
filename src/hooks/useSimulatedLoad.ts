import { useEffect, useState } from 'react';

/** Mimics network latency so loading states show on first load and whenever `key` changes. */
export function useSimulatedLoad(key: string | null, ms = 350) {
  const [readyKey, setReadyKey] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setReadyKey(key), ms);
    return () => clearTimeout(timer);
  }, [key, ms]);

  return readyKey === key;
}
