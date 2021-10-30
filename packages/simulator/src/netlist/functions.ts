import { NameMap } from "../util/map";

export type Func = readonly [
  func: (...args: number[]) => number,
  numArgs: number,
];

const funcDefs = new NameMap<Func>([
  ["abs", [Math.abs, 1]],
  ["sin", [Math.sin, 1]],
  ["asin", [Math.asin, 1]],
  ["cos", [Math.cos, 1]],
  ["acos", [Math.acos, 1]],
  ["tan", [Math.tan, 1]],
  ["atan", [Math.atan, 1]],
  ["exp", [Math.exp, 1]],
  ["log", [Math.log, 1]],
  ["sqrt", [Math.sqrt, 1]],
  ["pow", [Math.pow, 2]],
  ["min", [Math.min, 0]],
  ["max", [Math.max, 0]],
]);

export function addFuncDef(name: string, [func, numArgs]: Func): void {
  funcDefs.set(name, [func, numArgs]);
}

export function callFunc(name: string, args: number[]): number {
  const funcDef = funcDefs.get(name);
  if (funcDef == null) {
    throw new TypeError(`Unknown function [${name}]`);
  }
  const [func, numArgs] = funcDef;
  const { length } = args;
  if (
    (numArgs === 0 && length === 0) ||
    (numArgs !== 0 && length !== numArgs)
  ) {
    throw new TypeError(`Wrong number of arguments to function [${name}]`);
  }
  switch (length) {
    case 1:
      return func(args[0]);
    case 2:
      return func(args[0], args[1]);
    case 3:
      return func(args[0], args[1], args[2]);
    default:
      return func(...args);
  }
}
