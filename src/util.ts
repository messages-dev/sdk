export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
}

export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

export function transformKeys<T>(obj: T, fn: (key: string) => string): T {
  if (obj === null || obj === undefined || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map((item) => transformKeys(item, fn)) as T;
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    result[fn(key)] = transformKeys(value, fn);
  }
  return result as T;
}

type CamelCase<S extends string> = S extends `${infer P}_${infer C}${infer R}`
  ? `${P}${Uppercase<C>}${CamelCase<R>}`
  : S;

export type CamelCaseKeys<T> = T extends readonly (infer U)[]
  ? CamelCaseKeys<U>[]
  : T extends Record<string, unknown>
    ? { [K in keyof T as K extends string ? CamelCase<K> : K]: CamelCaseKeys<T[K]> }
    : T;
