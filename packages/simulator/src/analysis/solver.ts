import { vecClear, vecCopy, vecMake } from "@jssim/math/lib/matrix.js";
import { Method, SLE } from "@jssim/math/lib/sle.js";
import type { Vector } from "@jssim/math/lib/types.js";
import type { Circuit } from "../circuit/circuit.js";
import { Stamper } from "../circuit/network.js";
import { logger } from "../util/logging.js";
import { ConvergenceError } from "./error.js";
import type { SimulationOptions } from "./options.js";

const enum ConvHelper {
  None,
  GMinStepping,
}

export class Solver {
  private readonly circuit: Circuit;
  private readonly options: SimulationOptions;
  private readonly sle: SLE;
  private readonly currX: Vector;
  private readonly prevX: Vector;
  private readonly backupX: Vector;
  private readonly currB: Vector;
  private readonly prevB: Vector;
  private readonly tol: Vector;
  private readonly stamper: Stamper;
  private readonly linear: boolean;
  private helper: ConvHelper;
  private gMin: number;

  constructor(circuit: Circuit, options: SimulationOptions) {
    this.circuit = circuit;
    this.options = options;
    this.sle = new SLE(circuit.nodes.length);
    this.currX = vecMake(this.sle.size);
    this.prevX = vecMake(this.sle.size);
    this.backupX = vecMake(this.sle.size);
    this.currB = vecMake(this.sle.size);
    this.prevB = vecMake(this.sle.size);
    this.tol = vecMake(this.sle.size);
    this.stamper = new Stamper(this.sle.A, this.sle.b);
    this.linear = circuit.devices.every((device) => device.deviceClass.linear);
    this.helper = ConvHelper.None;
    this.gMin = 0;

    const { abstol, vntol } = this.options;
    for (const node of this.circuit.nodes) {
      const { index } = node;
      switch (node.type) {
        case "node":
          this.tol[index] = vntol;
          break;
        case "branch":
          this.tol[index] = abstol;
          break;
      }
    }
  }

  reset(): void {
    vecClear(this.backupX);
  }

  solve(): void {
    logger.simulationStarted();
    this.helper = ConvHelper.None;
    this.gMin = 0;
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

    this.backupSolution();
    vecClear(this.prevX);
    vecClear(this.prevB);
    if (this.solveNormal()) {
      return;
    }

    // Next strategy.

    this.restoreSolution();
    vecClear(this.prevX);
    vecClear(this.prevB);
    if (this.solveGMinStepping()) {
      return;
    }

    // All strategies failed.

    throw new ConvergenceError(`Simulation did not converge.`);
  }

  private solveNormal(): boolean {
    this.helper = ConvHelper.None;
    this.gMin = 0;
    return this.iterate(this.options.maxIter);
  }

  private solveGMinStepping(): boolean {
    for (const gMin of [1e-3, 1e-4, 1e-5, 1e-6, 1e-7, 1e-8, 1e-9, 0]) {
      this.helper = ConvHelper.GMinStepping;
      this.gMin = gMin;
      if (!this.iterate(this.options.maxIter)) {
        return false;
      }
    }
    return true;
  }

  private iterate(maxIter: number): boolean {
    const { currX, prevX, prevB, currB } = this;
    this.startIteration();
    let iter = 0;
    while (iter < maxIter) {
      this.doIteration();
      const conv = iter > 0 && this.converged();
      vecCopy(currX, prevX);
      vecCopy(currB, prevB);
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
    if (this.helper === ConvHelper.GMinStepping) {
      this.applyGMin();
    }
    vecCopy(this.sle.b, this.currB);
    this.sle.solve(Method.Gauss);
    vecCopy(this.sle.x, this.currX);
    this.saveSolution();
    logger.iterationEnded();
  }

  private endIteration(): void {
    this.circuit.endEval();
  }

  private applyGMin(): void {
    const { sle, gMin } = this;
    const { size, A } = sle;
    for (let i = 0; i < size; i++) {
      A[i][i] += gMin;
    }
  }

  private converged(): boolean {
    const { reltol } = this.options;
    const { sle, currX, prevX, currB, prevB, tol } = this;
    const { size } = sle;
    for (let i = 0; i < size; i++) {
      const x1 = prevX[i];
      const x2 = currX[i];
      if (Math.abs(x2 - x1) >= tol[i] + reltol * Math.abs(x2)) {
        return false;
      }
      const b1 = prevB[i];
      const b2 = currB[i];
      if (Math.abs(b2 - b1) >= tol[i] + reltol * Math.abs(b2)) {
        return false;
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
