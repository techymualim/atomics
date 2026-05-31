import { useEffect, useState, useCallback } from "react";
import * as SecureStore from "expo-secure-store";

const SEEN_KEY = "atomics:onboardingSeen";

/** Tracks whether the user has completed the how-to-use walkthrough. */
export function useOnboarding() {
  const [seen, setSeen] = useState<boolean | null>(null);

  useEffect(() => {
    SecureStore.getItemAsync(SEEN_KEY)
      .then((v) => setSeen(v === "true"))
      .catch(() => setSeen(false));
  }, []);

  const complete = useCallback(() => {
    setSeen(true);
    SecureStore.setItemAsync(SEEN_KEY, "true").catch(() => undefined);
  }, []);

  return { seen, loading: seen === null, complete };
}
