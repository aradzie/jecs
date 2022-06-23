export type FunctionDef = readonly [func: (...args: number[]) => number, numArgs: number];

const defs = new Map<string, FunctionDef>([
  ["abs", [Math.abs, 1]],
  ["sin", [Math.sin, 1]],
  ["asin", [Math.asin, 1]],
  ["cos", [Math.cos, 1]],
  ["acos", [Math.acos, 1]],
  ["tan", [Math.tan, 1]],
  ["atan", [Math.atan, 1]],
  ["exp", [Math.exp, 1]],
  ["log", [Math.log, 1]],
  ["log10", [Math.log10, 1]],
  ["sqrt", [Math.sqrt, 1]],
  ["pow", [Math.pow, 2]],
  ["round", [Math.round, 1]],
  ["floor", [Math.floor, 1]],
  ["ceil", [Math.ceil, 1]],
  ["min", [Math.min, 0]],
  ["max", [Math.max, 0]],
  ["dB", [(v) => 10 * Math.log10(v), 1]],
]);

export function addFunction(name: string, def: FunctionDef): void {
  defs.set(name, def);
}

export function getFunction(name: string, length: number): FunctionDef {
  const def = defs.get(name);
  if (def == null) {
    throw new TypeError(`Unknown function [${name}]`);
  }
  const [, numArgs] = def;
  if ((numArgs === 0 && length === 0) || (numArgs !== 0 && length !== numArgs)) {
    throw new TypeError(`Wrong number of arguments to function [${name}]`);
  }
  return def;
}
