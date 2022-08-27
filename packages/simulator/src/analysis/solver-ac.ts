import { Sle, SleMethod } from "@jecs/math/lib/sle.js";
import type { Circuit } from "../circuit/circuit.js";
import { AcStamper } from "../circuit/mna.js";
import { logger } from "../util/logging.js";

export class AcSolver {
  private readonly circuit: Circuit;
  private readonly sle: Sle;
  private readonly stamper: AcStamper;

  constructor(circuit: Circuit) {
    this.circuit = circuit;
    this.sle = new Sle(circuit.nodes.length * 2);
    this.stamper = new AcStamper(this.sle.A, this.sle.b);
  }

  solve(): void {
    logger.simulationStarted();
    this.circuit.initAc();
    logger.iterationStarted();
    this.sle.clear();
    this.circuit.loadAc(this.stamper);
    this.sle.solve(SleMethod.Gauss);
    this.saveSolution();
    logger.iterationEnded();
    this.circuit.endAc();
    logger.simulationEnded();
  }

  private saveSolution(): void {
    const { x } = this.sle;
    for (const node of this.circuit.nodes) {
      const { index } = node;
      const xr = x[index * 2];
      const xi = x[index * 2 + 1];
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
