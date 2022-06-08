import type { Location, NetlistNode } from "./ast.js";

export class SyntaxError extends Error {
  readonly location: Location;

  constructor(message: string, expected: unknown, found: unknown, location: Location);
}

export function parse(input: string, options?: unknown): NetlistNode;
