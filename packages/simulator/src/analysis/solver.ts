import { vecClear, vecCopy, vecMake } from "@jssim/math/lib/matrix.js";
import { Method, SLE } from "@jssim/math/lib/sle.js";
import type { Vector } from "@jssim/math/lib/types.js";
import type { Circuit } from "../circuit/circuit.js";
import { Stamper } from "../circuit/network.js";
import { logger } from "../util/logging.js";
import { ConvergenceError } from "./error.js";
import type { SimulationOptions } from "./options.js";

export class Solver {
  private circuit: Circuit;
  private options: SimulationOptions;
  private sle: SLE;
  private currX: Vector;
  private prevX: Vector;
  private stamper: Stamper;
  private linear: boolean;

  constructor(circuit: Circuit, options: SimulationOptions) {
    this.circuit = circuit;
    this.options = options;
    const n = circuit.nodes.length;
    this.sle = new SLE(n);
    this.currX = this.sle.x;
    this.prevX = vecMake(n);
    this.stamper = new Stamper(this.sle.A, this.sle.b);
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
    this.sle.clear();
    vecClear(this.prevX);
  }

  private solveLinear(): void {
    this.startIteration();
    this.doIteration();
    this.endIteration();
  }

  private solveNonLinear(): void {
    const { options, sle, currX, prevX } = this;
    const { maxIter } = options;
    this.startIteration();
    let iter = 0;
    while (iter < maxIter) {
      this.doIteration();
      if (iter > 1 && this.converged()) {
        break;
      }
      vecCopy(currX, prevX);
      sle.clear();
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
    this.sle.solve(Method.Gauss);
    this.saveSolution();
    logger.iterationEnded();
  }

  private endIteration(): void {
    this.circuit.endEval();
  }

  private converged(): boolean {
    const { circuit, options, currX, prevX } = this;
    const { abstol, vntol, reltol } = options;
    for (const node of circuit.nodes) {
      const { index } = node;
      switch (node.type) {
        case "node": {
          const prevV = prevX[index];
          const currV = currX[index];
          if (Math.abs(currV - prevV) >= vntol + reltol * Math.abs(currV)) {
            return false;
          }
          break;
        }
        case "branch": {
          const prevI = prevX[index];
          const currI = currX[index];
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
    const { circuit, currX } = this;
    for (const node of circuit.nodes) {
      const { index } = node;
      switch (node.type) {
        case "node":
          node.voltage = currX[index];
          break;
        case "branch":
          node.current = currX[index];
          break;
      }
    }
  }
}
