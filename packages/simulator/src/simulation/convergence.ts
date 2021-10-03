import type { Vector } from "../math/types";
import { Branch, Node } from "./network";
import type { Options } from "./options";

const { abs } = Math;

export function converged(
  { abstol, vntol, reltol }: Options,
  nodes: readonly (Node | Branch)[],
  prev: Vector,
  curr: Vector,
): boolean {
  for (const node of nodes) {
    const { index } = node;
    if (node instanceof Node) {
      const prev_v = prev[index];
      const curr_v = curr[index];
      if (abs(curr_v - prev_v) >= vntol + reltol * abs(curr_v)) {
        return false;
      }
      continue;
    }
    if (node instanceof Branch) {
      const prev_i = prev[index];
      const curr_i = curr[index];
      if (abs(curr_i - prev_i) >= abstol + reltol * abs(curr_i)) {
        return false;
      }
      continue;
    }
  }
  return true;
}
