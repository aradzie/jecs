import { Device, DeviceState, EvalOptions } from "../../circuit/device.js";
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
  readonly np: Node;
  /** Negative terminal. */
  readonly nn: Node;
  /** Extra MNA branch. */
  private branch!: Branch;

  constructor(id: string, [np, nn]: readonly Node[]) {
    super(id, [np, nn]);
    this.np = np;
    this.nn = nn;
  }

  override connect(network: Network): void {
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

  override endEval(state: DeviceState, options: EvalOptions): void {
    const { branch } = this;
    const I = branch.current;
    const Imax = state[S.Imax];
    const Imin = state[S.Imin];
    const rmsSum = state[S.rmsSum] + I * I;
    const rmsCnt = state[S.rmsCnt] + 1;
    state[S.I] = I;
    state[S.Imax] = Imax === Imax ? Math.max(Imax, I) : I;
    state[S.Imin] = Imin === Imin ? Math.min(Imin, I) : I;
    state[S.Irms] = Math.sqrt(rmsSum / rmsCnt);
    state[S.rmsSum] = rmsSum;
    state[S.rmsCnt] = rmsCnt;
  }
}
