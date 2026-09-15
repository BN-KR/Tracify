export function isGoogleAnalyticsMeasurementId(value: string | undefined): value is string {
  return /^G-[A-Z0-9]+$/i.test(value ?? "");
}
