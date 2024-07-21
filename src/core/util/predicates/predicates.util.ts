export function isObject(obj: unknown): obj is object {
  return typeof obj === 'object' && !Array.isArray(obj) && obj !== null;
}

export function hasKey<T extends string | number | symbol>(
  obj: unknown,
  key: T,
): obj is { [key in T]: unknown } {
  return !!obj && typeof obj === 'object' && key in obj;
}
