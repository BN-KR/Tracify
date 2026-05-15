"use client";

let apiKey = "";
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

export function setOneTimeApiKey(value: string) {
  apiKey = value;
  emit();
}

export function getOneTimeApiKey() {
  return apiKey;
}

export function hasOneTimeApiKey() {
  return apiKey.length > 0;
}

export function clearOneTimeApiKey() {
  apiKey = "";
  emit();
}

export function subscribeToOneTimeApiKey(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
