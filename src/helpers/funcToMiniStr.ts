const functionCache = new WeakMap<(...args: any[]) => any, string>();

function funcToMiniStr(fn: (...args: any[]) => any): string {
  if (functionCache.has(fn)) return functionCache.get(fn)!;

  let normalized = "";
  try {
    // убираем лишнее
    normalized = fn.toString().replace(/\s+/g, "").replace(/;+/g, ";");
  } catch {
    // fallback
    normalized = "";
  }

  functionCache.set(fn, normalized);
  return normalized;
}

export default funcToMiniStr;
