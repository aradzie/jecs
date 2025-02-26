import { Sle, SleMethod, vecClear, vecCopy, vecMake, type Vector } from "@jecs/math";
import { type Branch, type Circuit, type Node, RealStamper } from "../circuit/index.js";
import { Props, type PropsSchema } from "../props/index.js";
import { logger } from "../util/logging.js";
import { ConvergenceError } from "./error.js";

const enum ConvHelper {
  None,
  SourceStepping,
  GMinStepping,
}

const sourceFactorList = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
const gMinList = [1e-3, 1e-4, 1e-5, 1e-6, 1e-7, 1e-8, 1e-9, 0];

export class NonlinearSolver {
  static readonly propsSchema: PropsSchema = {
    abstol: Props.number({
      defaultValue: 1e-12, // 1pA
      range: ["real", ">", 0],
      title: "absolute current error tolerance in amperes",
    }),
    vntol: Props.number({
      defaultValue: 1e-6, // 1uV
      range: ["real", ">", 0],
      title: "absolute voltage error tolerance in volts",
    }),
    reltol: Props.number({
      defaultValue: 1e-3,
      range: ["real", ">", 0],
      title: "relative error tolerance",
    }),
    maxIter: Props.number({
      defaultValue: 150,
      range: ["integer", ">", 1],
      title: "maximum number of iterations",
    }),
  };

  readonly #options: ConvergenceOptions;
  readonly #circuit: Circuit;
  readonly #nodes: readonly (Node | Branch)[];
  readonly #sle: Sle;
  readonly #backupX: Vector;
  readonly #currX: Vector;
  readonly #prevX: Vector;
  readonly #currB: Vector;
  readonly #prevB: Vector;
  readonly #stamper: RealStamper;
  #helper: ConvHelper;
  #sourceFactor: number;
  #gMin: number;

  constructor(circuit: Circuit, props: Props) {
    circuit.init("dc");
    this.#options = getConvergenceOptions(props);
    this.#circuit = circuit;
    this.#nodes = circuit.reindexNodes();
    this.#sle = new Sle(this.#nodes.length);
    this.#backupX = vecMake(this.#nodes.length);
    this.#currX = vecMake(this.#nodes.length);
    this.#prevX = vecMake(this.#nodes.length);
    this.#currB = vecMake(this.#nodes.length);
    this.#prevB = vecMake(this.#nodes.length);
    this.#stamper = new RealStamper(this.#sle.A, this.#sle.b);
    this.#helper = ConvHelper.None;
    this.#sourceFactor = 1;
    this.#gMin = 0;
  }

  solveDc(): void {
    this.#load = this.#loadDc;
    this.#save = this.#saveDc;
    logger.simulationStarted();
    this.#solveNonLinear();
    logger.simulationEnded();
  }

  solveTr(): void {
    this.#load = this.#loadTr;
    this.#save = this.#saveTr;
    logger.simulationStarted();
    this.#solveNonLinear();
    logger.simulationEnded();
  }

  #load!: (stamper: RealStamper) => void;
  #save!: () => void;

  #loadDc = (stamper: RealStamper) => {
    this.#circuit.loadDc(stamper);
  };

  #saveDc = () => {
    this.#circuit.saveDc();
  };

  #loadTr = (stamper: RealStamper) => {
    this.#circuit.loadTr(stamper);
  };

  #saveTr = () => {
    this.#circuit.saveTr();
  };

  #solveNonLinear(): void {
    // Next strategy.

    this.#backupSolution();
    vecClear(this.#prevX);
    vecClear(this.#prevB);
    if (this.#solveNonLinear_Normal()) {
      return;
    }

    // Next strategy.

    this.#restoreSolution();
    vecClear(this.#prevX);
    vecClear(this.#prevB);
    if (this.#solveNonLinear_SourceStepping()) {
      return;
    }

    // Next strategy.

    this.#restoreSolution();
    vecClear(this.#prevX);
    vecClear(this.#prevB);
    if (this.#solveNonLinear_GMinStepping()) {
      return;
    }

    // All strategies failed.

    throw new ConvergenceError(`Simulation did not converge.`);
  }

  #solveNonLinear_Normal(): boolean {
    this.#helper = ConvHelper.None;
    this.#sourceFactor = 1;
    this.#gMin = 0;
    return this.#iterate(this.#options.maxIter);
  }

  #solveNonLinear_SourceStepping(): boolean {
    for (const sourceFactor of sourceFactorList) {
      this.#helper = ConvHelper.SourceStepping;
      this.#sourceFactor = sourceFactor;
      this.#gMin = 0;
      if (!this.#iterate(this.#options.maxIter)) {
        return false;
      }
    }
    return true;
  }

  #solveNonLinear_GMinStepping(): boolean {
    for (const gMin of gMinList) {
      this.#helper = ConvHelper.GMinStepping;
      this.#sourceFactor = 1;
      this.#gMin = gMin;
      if (!this.#iterate(this.#options.maxIter)) {
        return false;
      }
    }
    return true;
  }

  #iterate(maxIter: number): boolean {
    this.#circuit.sourceFactor = this.#sourceFactor;
    let iter = 0;
    while (iter < maxIter) {
      this.#doIteration();
      const conv = iter > 0 && this.#converged();
      vecCopy(this.#currX, this.#prevX);
      vecCopy(this.#currB, this.#prevB);
      if (conv) {
        this.#save();
        return true;
      }
      iter += 1;
    }
    return false;
  }

  #doIteration(): void {
    logger.iterationStarted();
    this.#sle.clear();
    this.#load(this.#stamper);
    if (this.#helper === ConvHelper.GMinStepping) {
      this.#applyGMin();
    }
    vecCopy(this.#sle.b, this.#currB);
    this.#sle.solve(SleMethod.Gauss);
    vecCopy(this.#sle.x, this.#currX);
    this.#saveSolution();
    logger.iterationEnded();
  }

  #applyGMin(): void {
    for (let i = 0; i < this.#sle.size; i++) {
      this.#sle.A[i][i] += this.#gMin;
    }
  }

  #converged(): boolean {
    const { abstol, vntol, reltol } = this.#options;
    for (const node of this.#nodes) {
      const { index } = node;
      switch (node.type) {
        case "node": {
          const v1 = this.#prevX[index];
          const v2 = this.#currX[index];
          if (Math.abs(v2 - v1) >= reltol * Math.abs(v2) + vntol) {
            return false;
          }
          const i1 = this.#prevB[index];
          const i2 = this.#currB[index];
          if (Math.abs(i2 - i1) >= reltol * Math.abs(i2) + abstol) {
            return false;
          }
          break;
        }
        case "branch": {
          const i1 = this.#prevX[index];
          const i2 = this.#currX[index];
          if (Math.abs(i2 - i1) >= reltol * Math.abs(i2) + abstol) {
            return false;
          }
          const v1 = this.#prevB[index];
          const v2 = this.#currB[index];
          if (Math.abs(v2 - v1) >= reltol * Math.abs(v2) + vntol) {
            return false;
          }
          break;
        }
      }
    }
    return true;
  }

  #saveSolution(): void {
    for (const node of this.#nodes) {
      const { index } = node;
      switch (node.type) {
        case "node":
          node.voltage = this.#currX[index];
          break;
        case "branch":
          node.current = this.#currX[index];
          break;
      }
    }
  }

  #backupSolution(): void {
    for (const node of this.#nodes) {
      const { index } = node;
      switch (node.type) {
        case "node":
          this.#backupX[index] = node.voltage;
          break;
        case "branch":
          this.#backupX[index] = node.current;
          break;
      }
    }
  }

  #restoreSolution(): void {
    for (const node of this.#nodes) {
      const { index } = node;
      switch (node.type) {
        case "node":
          node.voltage = this.#backupX[index];
          break;
        case "branch":
          node.current = this.#backupX[index];
          break;
      }
    }
  }
}

type ConvergenceOptions = {
  /** Absolute current error tolerance, `A`. */
  readonly abstol: number;
  /** Absolute voltage error tolerance, `V`. */
  readonly vntol: number;
  /** Relative error tolerance. */
  readonly reltol: number;
  /** Maximum number of non-linear iterations. */
  readonly maxIter: number;
};

function getConvergenceOptions(props: Props): ConvergenceOptions {
  return {
    abstol: props.getNumber("abstol"),
    vntol: props.getNumber("vntol"),
    reltol: props.getNumber("reltol"),
    maxIter: props.getNumber("maxIter"),
  };
}
