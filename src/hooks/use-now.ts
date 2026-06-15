"use client";

import { useEffect, useState } from "react";

export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, intervalMs);

    return () => window.clearInterval(intervalId);
  }, [intervalMs]);

  return now;
}
