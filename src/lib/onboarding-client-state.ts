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

const RETURN_PATH_STORAGE_KEY = "5to1r.onboarding.returnPath";

export function setReturnPath(value: string) {
  if (typeof window !== "undefined") {
    const normalizedValue = value.includes("/dashboard/no-project")
      ? "/dashboard"
      : value;
    window.sessionStorage.setItem(RETURN_PATH_STORAGE_KEY, normalizedValue);
    emit();
  }
}

export function getReturnPath() {
  if (typeof window !== "undefined") {
    return window.sessionStorage.getItem(RETURN_PATH_STORAGE_KEY) ?? "";
  }
  return "";
}

export function clearReturnPath() {
  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem(RETURN_PATH_STORAGE_KEY);
    emit();
  }
}

export function subscribeToOneTimeApiKey(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
