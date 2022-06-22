import { vecClear, vecCopy, vecMake } from "@jssim/math/lib/matrix.js";
import { Method, SLE } from "@jssim/math/lib/sle.js";
import type { Vector } from "@jssim/math/lib/types.js";
import type { Circuit } from "../circuit/circuit.js";
import { Stamper } from "../circuit/network.js";
import { logger } from "../util/logging.js";
import { ConvergenceError } from "./error.js";
import type { SimulationOptions } from "./options.js";

export class Solver {
  private readonly circuit: Circuit;
  private readonly options: SimulationOptions;
  private readonly sle: SLE;
  private readonly currX: Vector;
  private readonly prevX: Vector;
  private readonly backupX: Vector;
  private readonly stamper: Stamper;
  private readonly linear: boolean;

  constructor(circuit: Circuit, options: SimulationOptions) {
    this.circuit = circuit;
    this.options = options;
    this.sle = new SLE(circuit.nodes.length);
    this.currX = this.sle.x;
    this.prevX = vecMake(this.currX.length);
    this.backupX = vecMake(this.currX.length);
    this.stamper = new Stamper(this.sle.A, this.sle.b);
    this.linear = circuit.devices.every((device) => device.deviceClass.linear);
  }

  reset(): void {
    vecClear(this.prevX);
    vecClear(this.backupX);
  }

  solve(): void {
    logger.simulationStarted();
    if (this.linear) {
      this.solveLinear();
    } else {
      this.solveNonLinear();
    }
    logger.simulationEnded();
  }

  private solveLinear(): void {
    this.startIteration();
    this.doIteration();
    this.endIteration();
  }

  private solveNonLinear(): void {
    // Next strategy.

    if (this.solveNormal()) {
      return;
    }

    // All strategies failed.

    throw new ConvergenceError(`Simulation did not converge.`);
  }

  private solveNormal(): boolean {
    return this.iterate(this.options.maxIter);
  }

  private iterate(maxIter: number): boolean {
    const { currX, prevX } = this;
    this.startIteration();
    let iter = 0;
    while (iter < maxIter) {
      this.doIteration();
      const conv = iter > 0 && this.converged();
      vecCopy(currX, prevX);
      if (conv) {
        this.endIteration();
        return true;
      }
      iter += 1;
    }
    return false;
  }

  private startIteration(): void {
    this.circuit.beginEval();
  }

  private doIteration(): void {
    logger.iterationStarted();
    this.sle.clear();
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
    const { abstol, vntol, reltol } = this.options;
    const { currX, prevX } = this;
    for (const node of this.circuit.nodes) {
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
    const { currX } = this;
    for (const node of this.circuit.nodes) {
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

  private backupSolution(): void {
    const { backupX } = this;
    for (const node of this.circuit.nodes) {
      const { index } = node;
      switch (node.type) {
        case "node":
          backupX[index] = node.voltage;
          break;
        case "branch":
          backupX[index] = node.current;
          break;
      }
    }
  }

  private restoreSolution(): void {
    const { backupX } = this;
    for (const node of this.circuit.nodes) {
      const { index } = node;
      switch (node.type) {
        case "node":
          node.voltage = backupX[index];
          break;
        case "branch":
          node.current = backupX[index];
          break;
      }
    }
  }
}
