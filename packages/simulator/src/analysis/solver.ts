import { vecClear, vecCopy, vecMake } from "@jecs/math/lib/matrix.js";
import { Method, SLE } from "@jecs/math/lib/sle.js";
import type { Vector } from "@jecs/math/lib/types.js";
import type { Circuit } from "../circuit/circuit.js";
import { Stamper } from "../circuit/mna.js";
import { Properties, PropertiesSchema } from "../circuit/properties.js";
import { logger } from "../util/logging.js";
import { ConvergenceError } from "./error.js";

const enum ConvHelper {
  None,
  SourceStepping,
  GMinStepping,
}

const sourceFactorList = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
const gMinList = [1e-3, 1e-4, 1e-5, 1e-6, 1e-7, 1e-8, 1e-9, 0];

export class Solver {
  static readonly propertiesSchema: PropertiesSchema = {
    abstol: Properties.number({
      defaultValue: 1e-12, // 1pA
      range: ["real", ">", 0],
      title: "absolute current error tolerance in amperes",
    }),
    vntol: Properties.number({
      defaultValue: 1e-6, // 1uV
      range: ["real", ">", 0],
      title: "absolute voltage error tolerance in volts",
    }),
    reltol: Properties.number({
      defaultValue: 1e-3,
      range: ["real", ">", 0],
      title: "relative error tolerance",
    }),
    maxIter: Properties.number({
      defaultValue: 150,
      range: ["integer", ">", 1],
      title: "maximum number of iterations",
    }),
  };

  private readonly circuit: Circuit;
  private readonly options: ConvergenceOptions;
  private readonly sle: SLE;
  private readonly backupX: Vector;
  private readonly currX: Vector;
  private readonly prevX: Vector;
  private readonly currB: Vector;
  private readonly prevB: Vector;
  private readonly stamper: Stamper;
  private helper: ConvHelper;
  private sourceFactor: number;
  private gMin: number;

  private init: () => void = () => {};
  private load: (stamper: Stamper) => void = () => {};
  private end: () => void = () => {};

  constructor(circuit: Circuit, properties: Properties) {
    this.circuit = circuit;
    this.options = getConvergenceOptions(properties);
    this.sle = new SLE(circuit.nodes.length);
    this.backupX = vecMake(this.sle.size);
    this.currX = vecMake(this.sle.size);
    this.prevX = vecMake(this.sle.size);
    this.currB = vecMake(this.sle.size);
    this.prevB = vecMake(this.sle.size);
    this.stamper = new Stamper(this.sle.A, this.sle.b);
    this.helper = ConvHelper.None;
    this.sourceFactor = 1;
    this.gMin = 0;
  }

  useDc() {
    this.init = () => {
      this.circuit.initDc();
    };
    this.load = (stamper) => {
      this.circuit.loadDc(stamper);
    };
    this.end = () => {
      this.circuit.endDc();
    };
  }

  useTr() {
    this.init = () => {
      this.circuit.initTr();
    };
    this.load = (stamper) => {
      this.circuit.loadTr(stamper);
    };
    this.end = () => {
      this.circuit.endTr();
    };
  }

  solve(): void {
    logger.simulationStarted();
    this.solveNonLinear();
    logger.simulationEnded();
  }

  private solveNonLinear(): void {
    // Next strategy.

    this.backupSolution();
    vecClear(this.prevX);
    vecClear(this.prevB);
    if (this.solveNonLinear_Normal()) {
      return;
    }

    // Next strategy.

    this.restoreSolution();
    vecClear(this.prevX);
    vecClear(this.prevB);
    if (this.solveNonLinear_SourceStepping()) {
      return;
    }

    // Next strategy.

    this.restoreSolution();
    vecClear(this.prevX);
    vecClear(this.prevB);
    if (this.solveNonLinear_GMinStepping()) {
      return;
    }

    // All strategies failed.

    throw new ConvergenceError(`Simulation did not converge.`);
  }

  private solveNonLinear_Normal(): boolean {
    this.helper = ConvHelper.None;
    this.sourceFactor = 1;
    this.gMin = 0;
    return this.iterate(this.options.maxIter);
  }

  private solveNonLinear_SourceStepping(): boolean {
    for (const sourceFactor of sourceFactorList) {
      this.helper = ConvHelper.SourceStepping;
      this.sourceFactor = sourceFactor;
      this.gMin = 0;
      if (!this.iterate(this.options.maxIter)) {
        return false;
      }
    }
    return true;
  }

  private solveNonLinear_GMinStepping(): boolean {
    for (const gMin of gMinList) {
      this.helper = ConvHelper.GMinStepping;
      this.sourceFactor = 1;
      this.gMin = gMin;
      if (!this.iterate(this.options.maxIter)) {
        return false;
      }
    }
    return true;
  }

  private iterate(maxIter: number): boolean {
    this.circuit.sourceFactor = this.sourceFactor;
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
    this.init();
  }

  private doIteration(): void {
    logger.iterationStarted();
    this.sle.clear();
    this.load(this.stamper);
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
    this.end();
  }

  private applyGMin(): void {
    const { sle, gMin } = this;
    const { size, A } = sle;
    for (let i = 0; i < size; i++) {
      A[i][i] += gMin;
    }
  }

  private converged(): boolean {
    const { currX, prevX, currB, prevB } = this;
    const { abstol, vntol, reltol } = this.options;
    for (const node of this.circuit.nodes) {
      const { index } = node;
      switch (node.type) {
        case "node": {
          const v1 = prevX[index];
          const v2 = currX[index];
          if (Math.abs(v2 - v1) >= reltol * Math.abs(v2) + vntol) {
            return false;
          }
          const i1 = prevB[index];
          const i2 = currB[index];
          if (Math.abs(i2 - i1) >= reltol * Math.abs(i2) + abstol) {
            return false;
          }
          break;
        }
        case "branch": {
          const i1 = prevX[index];
          const i2 = currX[index];
          if (Math.abs(i2 - i1) >= reltol * Math.abs(i2) + abstol) {
            return false;
          }
          const v1 = prevB[index];
          const v2 = currB[index];
          if (Math.abs(v2 - v1) >= reltol * Math.abs(v2) + vntol) {
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

interface ConvergenceOptions {
  /** Absolute current error tolerance, `A`. */
  readonly abstol: number;
  /** Absolute voltage error tolerance, `V`. */
  readonly vntol: number;
  /** Relative error tolerance. */
  readonly reltol: number;
  /** Maximum number of non-linear iterations. */
  readonly maxIter: number;
}

function getConvergenceOptions(properties: Properties): ConvergenceOptions {
  return {
    abstol: properties.getNumber("abstol"),
    vntol: properties.getNumber("vntol"),
    reltol: properties.getNumber("reltol"),
    maxIter: properties.getNumber("maxIter"),
  };
}
