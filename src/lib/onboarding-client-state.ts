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
const ONBOARDING_DISMISSED_STORAGE_KEY = "5to1r.onboarding.dismissed";

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

/**
 * Setup is always available from the dashboard, but leaving it must not make
 * routine project navigation feel like a required setup flow.
 */
export function dismissOnboarding() {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(ONBOARDING_DISMISSED_STORAGE_KEY, "true");
    emit();
  }
}

export function hasDismissedOnboarding() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(ONBOARDING_DISMISSED_STORAGE_KEY) === "true";
}

export function subscribeToOneTimeApiKey(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
