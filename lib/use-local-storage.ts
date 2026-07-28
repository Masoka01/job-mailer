"use client";

import { useState, useLayoutEffect } from "react";

export function useLocalStorage<T>(key: string, initial: T): [T, (v: T) => void] {
  const [isInitialized, setIsInitialized] = useState(false);
  const [val, setVal] = useState<T>(initial);

  useLayoutEffect(() => {
    try {
      const s = localStorage.getItem(key);
      if (s !== null) {
        setVal(JSON.parse(s));
      }
    } catch {}
    setIsInitialized(true);
  }, [key]);

  const setValue = (newValue: T) => {
    setVal(newValue);
    localStorage.setItem(key, JSON.stringify(newValue));
  };

  if (!isInitialized) return [initial, setValue];

  return [val, setValue];
}
