"use client";

import { useEffect, useState } from "react";
import { loadOpenAiTokenizer, type OpenAiTokenizer } from "@/lib/tools/tokens";

export type TokenizerState = { status: "loading" | "ready" | "failed"; tokenizer: OpenAiTokenizer | null };

/** Loads the real tokenizer in the background. Tools still work (with a rough estimate) if it cannot load. */
export function useTokenizer(): TokenizerState {
  const [state, setState] = useState<TokenizerState>({ status: "loading", tokenizer: null });
  useEffect(() => {
    let alive = true;
    loadOpenAiTokenizer()
      .then((tokenizer) => alive && setState({ status: "ready", tokenizer }))
      .catch(() => alive && setState({ status: "failed", tokenizer: null }));
    return () => {
      alive = false;
    };
  }, []);
  return state;
}
