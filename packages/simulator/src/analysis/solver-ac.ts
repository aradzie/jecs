import { Sle, SleMethod } from "@jecs/math";
import { type Branch, type Circuit, ComplexStamper, type Node } from "../circuit/index.js";
import { logger } from "../util/logging.js";

export class AcSolver {
  readonly #circuit: Circuit;
  readonly #nodes: readonly (Node | Branch)[];
  readonly #sle: Sle;
  readonly #stamper: ComplexStamper;

  constructor(circuit: Circuit) {
    circuit.init("ac");
    this.#circuit = circuit;
    this.#nodes = circuit.reindexNodes();
    this.#sle = new Sle(this.#nodes.length * 2);
    this.#stamper = new ComplexStamper(this.#sle.A, this.#sle.b);
  }

  solve(): void {
    logger.simulationStarted();
    logger.iterationStarted();
    this.#sle.clear();
    this.#circuit.loadAc(this.#stamper);
    this.#sle.solve(SleMethod.Gauss);
    this.#saveSolution();
    logger.iterationEnded();
    logger.simulationEnded();
  }

  #saveSolution(): void {
    for (const node of this.#nodes) {
      const { index } = node;
      const xr = this.#sle.x[index * 2];
      const xi = this.#sle.x[index * 2 + 1];
      switch (node.type) {
        case "node":
          node.voltage = cxMagnitude(xr, xi);
          node.phase = cxPhase(xr, xi);
          break;
        case "branch":
          node.current = cxMagnitude(xr, xi);
          node.phase = cxPhase(xr, xi);
          break;
      }
    }
  }
}

function cxMagnitude(r: number, i: number): number {
  return Math.sqrt(r * r + i * i);
}

function cxPhase(r: number, i: number): number {
  return (180 / Math.PI) * Math.atan2(i, r);
}
