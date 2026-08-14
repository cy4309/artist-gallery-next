export function isAllowedAppReturnTo(value: string): boolean {
  return value.startsWith("cyc-zine://") || value.startsWith("exp://");
}
