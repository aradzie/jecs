import type { Vector } from "@jssim/math/lib/types.js";
import type { Branch, Node } from "../circuit/network.js";
import { SimulationError } from "./error.js";
import type { ConvergenceOptions } from "./options.js";

export class Controller implements Iterable<number> {
  private readonly maxIter: number;
  private iter: number;

  constructor({ maxIter }: ConvergenceOptions) {
    this.maxIter = Math.floor(maxIter);
    this.iter = 0;
  }

  *[Symbol.iterator](): IterableIterator<number> {
    for (this.iter = 0; this.iter < this.maxIter; this.iter += 1) {
      yield this.iter;
    }
    throw new SimulationError(`Simulation did not converge after ${this.iter} iterations.`);
  }
}

export function converged(
  { abstol, vntol, reltol }: ConvergenceOptions,
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
