import { solve } from "@jssim/math/lib/gauss-elimination.js";
import { matClear, matMake, vecClear, vecCopy, vecMake } from "@jssim/math/lib/matrix.js";
import type { Matrix, Vector } from "@jssim/math/lib/types.js";
import type { Circuit } from "../circuit/circuit.js";
import { Stamper } from "../circuit/network.js";
import { logger } from "../util/logging.js";
import { ConvergenceError } from "./error.js";
import type { SimulationOptions } from "./options.js";

export class Solver {
  private circuit: Circuit;
  private options: SimulationOptions;
  private matrix: Matrix;
  private vector: Vector;
  private prevVector: Vector;
  private stamper: Stamper;
  private linear: boolean;

  constructor(circuit: Circuit, options: SimulationOptions) {
    this.circuit = circuit;
    this.options = options;
    const n = circuit.nodes.length;
    this.matrix = matMake(n, n);
    this.vector = vecMake(n);
    this.prevVector = vecMake(n);
    this.stamper = new Stamper(this.matrix, this.vector);
    this.linear = circuit.devices.every((device) => device.deviceClass.linear);
  }

  solve(): void {
    logger.simulationStarted();
    this.clear();
    if (this.linear) {
      this.solveLinear();
    } else {
      this.solveNonLinear();
    }
    logger.simulationEnded();
  }

  private clear(): void {
    matClear(this.matrix);
    vecClear(this.vector);
    vecClear(this.prevVector);
  }

  private solveLinear(): void {
    this.startIteration();
    this.doIteration();
    this.endIteration();
  }

  private solveNonLinear(): void {
    const { options, matrix, vector, prevVector } = this;
    const { maxIter } = options;
    this.startIteration();
    let iter = 0;
    while (iter < maxIter) {
      this.doIteration();
      if (iter > 1 && this.converged()) {
        break;
      }
      vecCopy(vector, prevVector);
      matClear(matrix);
      vecClear(vector);
      iter += 1;
    }
    if (iter === maxIter) {
      throw new ConvergenceError(`Simulation did not converge after ${iter} iterations.`);
    }
    this.endIteration();
  }

  private startIteration(): void {
    this.circuit.beginEval();
  }

  private doIteration(): void {
    logger.iterationStarted();
    this.circuit.eval();
    this.circuit.stamp(this.stamper);
    solve(this.matrix, this.vector);
    this.saveSolution();
    logger.iterationEnded();
  }

  private endIteration(): void {
    this.circuit.endEval();
  }

  private converged(): boolean {
    const { circuit, options, vector, prevVector } = this;
    const { abstol, vntol, reltol } = options;
    for (const node of circuit.nodes) {
      const { index } = node;
      switch (node.type) {
        case "node": {
          const prevV = prevVector[index];
          const currV = vector[index];
          if (Math.abs(currV - prevV) >= vntol + reltol * Math.abs(currV)) {
            return false;
          }
          break;
        }
        case "branch": {
          const prevI = prevVector[index];
          const currI = vector[index];
          if (Math.abs(currI - prevI) >= abstol + reltol * Math.abs(currI)) {
            return false;
          }
          break;
        }
      }
    }
    return true;
  }

  private saveSolution(): void {
    const { circuit, vector } = this;
    for (const node of circuit.nodes) {
      const { index } = node;
      switch (node.type) {
        case "node":
          node.voltage = vector[index];
          break;
        case "branch":
          node.current = vector[index];
          break;
      }
    }
  }
}
