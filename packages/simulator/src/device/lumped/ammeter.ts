import { Device, DeviceState, EvalParams } from "../../circuit/device.js";
import type { Branch, Network, Node, Stamper } from "../../circuit/network.js";

const enum S {
  /** Current through probe. */
  I,
  Imax,
  Imin,
  Irms,
  rmsSum,
  rmsCnt,
  _Size_,
}

/**
 * Ammeter.
 */
export class Ammeter extends Device {
  static override readonly id = "Ammeter";
  static override readonly numTerminals = 2;
  static override readonly propertiesSchema = {};
  static override readonly stateSchema = {
    length: S._Size_,
    ops: [
      { index: S.I, name: "I", unit: "A" },
      { index: S.Imax, name: "Imax", unit: "A" },
      { index: S.Imin, name: "Imin", unit: "A" },
      { index: S.Irms, name: "Irms", unit: "A" },
    ],
  };

  /** Positive terminal. */
  private np!: Node;
  /** Negative terminal. */
  private nn!: Node;
  /** Extra MNA branch. */
  private branch!: Branch;

  override connect(network: Network, [np, nn]: readonly Node[]): void {
    this.np = np;
    this.nn = nn;
    this.branch = network.makeBranch(this.np, this.nn);
  }

  override deriveState(state: DeviceState): void {
    state[S.Imax] = NaN;
    state[S.Imin] = NaN;
    state[S.Irms] = NaN;
    state[S.rmsSum] = 0;
    state[S.rmsCnt] = 0;
  }

  override stamp(state: DeviceState, stamper: Stamper): void {
    const { np, nn, branch } = this;
    stamper.stampVoltageSource(np, nn, branch, 0);
  }

  override endEval(state: DeviceState, { timeStep }: EvalParams): void {
    const { branch } = this;
    const I = branch.current;
    state[S.I] = I;
    if (timeStep === timeStep) {
      const Imax = state[S.Imax];
      const Imin = state[S.Imin];
      const rmsSum = state[S.rmsSum] + I * I;
      const rmsCnt = state[S.rmsCnt] + 1;
      state[S.Imax] = Imax === Imax ? Math.max(Imax, I) : I;
      state[S.Imin] = Imin === Imin ? Math.min(Imin, I) : I;
      state[S.Irms] = Math.sqrt(rmsSum / rmsCnt);
      state[S.rmsSum] = rmsSum;
      state[S.rmsCnt] = rmsCnt;
    }
  }
}
