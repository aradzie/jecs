import type { Vector } from "@jssim/math/lib/types.js";
import type { Branch, Node } from "../circuit/network.js";
import type { Options } from "./options.js";

export function converged(
  { abstol, vntol, reltol }: Options,
  nodes: readonly (Node | Branch)[],
  prev: Vector,
  curr: Vector,
): boolean {
  for (const node of nodes) {
    const { index } = node;
    switch (node.type) {
      case "node": {
        const prevV = prev[index];
        const currV = curr[index];
        if (Math.abs(currV - prevV) >= vntol + reltol * Math.abs(currV)) {
          return false;
        }
        break;
      }
      case "branch": {
        const prevI = prev[index];
        const currI = curr[index];
        if (Math.abs(currI - prevI) >= abstol + reltol * Math.abs(currI)) {
          return false;
        }
        break;
      }
    }
  }
  return true;
}
