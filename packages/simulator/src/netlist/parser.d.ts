import type { Location, Netlist } from "./ast";

export class SyntaxError extends Error {
  readonly location: Location;

  constructor(
    message: string,
    expected: unknown,
    found: unknown,
    location: Location,
  );
}

export function parse(input: string, options?: unknown): Netlist;
