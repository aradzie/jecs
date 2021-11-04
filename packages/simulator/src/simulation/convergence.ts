import type { Vector } from "@jssim/math/lib/types";
import { Branch, Node } from "../circuit/network";
import type { Options } from "./options";

export function converged(
  { abstol, vntol, reltol }: Options,
  nodes: readonly (Node | Branch)[],
  prev: Vector,
  curr: Vector,
): boolean {
  for (const node of nodes) {
    const { index } = node;
    if (node instanceof Node) {
      const prevV = prev[index];
      const currV = curr[index];
      if (Math.abs(currV - prevV) >= vntol + reltol * Math.abs(currV)) {
        return false;
      }
      continue;
    }
    if (node instanceof Branch) {
      const prevI = prev[index];
      const currI = curr[index];
      if (Math.abs(currI - prevI) >= abstol + reltol * Math.abs(currI)) {
        return false;
      }
      continue;
    }
  }
  return true;
}
