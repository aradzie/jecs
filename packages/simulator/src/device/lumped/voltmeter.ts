import { Device, DeviceState } from "../../circuit/device.js";
import type { Node } from "../../circuit/network.js";

const enum S {
  /** Voltage through probe. */
  V,
  Vmax,
  Vmin,
  Vrms,
  rmsSum,
  rmsCnt,
  _Size_,
}

/**
 * Voltmeter.
 */
export class Voltmeter extends Device {
  static override readonly id = "Voltmeter";
  static override readonly numTerminals = 2;
  static override readonly propertiesSchema = {};
  static override readonly stateSchema = {
    length: S._Size_,
    ops: [
      { index: S.V, name: "V", unit: "V" },
      { index: S.Vmax, name: "Vmax", unit: "V" },
      { index: S.Vmin, name: "Vmin", unit: "V" },
      { index: S.Vrms, name: "Vrms", unit: "V" },
    ],
  };

  /** Positive terminal. */
  readonly np: Node;
  /** Negative terminal. */
  readonly nn: Node;

  constructor(id: string, [np, nn]: readonly Node[]) {
    super(id, [np, nn]);
    this.np = np;
    this.nn = nn;
  }

  override deriveState(state: DeviceState): void {
    state[S.Vmax] = NaN;
    state[S.Vmin] = NaN;
    state[S.Vrms] = NaN;
    state[S.rmsSum] = 0;
    state[S.rmsCnt] = 0;
  }

  override endEval(state: DeviceState): void {
    const { np, nn } = this;
    const V = np.voltage - nn.voltage;
    const Vmax = state[S.Vmax];
    const Vmin = state[S.Vmin];
    const rmsSum = state[S.rmsSum] + V * V;
    const rmsCnt = state[S.rmsCnt] + 1;
    state[S.V] = V;
    state[S.Vmax] = Vmax === Vmax ? Math.max(Vmax, V) : V;
    state[S.Vmin] = Vmin === Vmin ? Math.min(Vmin, V) : V;
    state[S.Vrms] = Math.sqrt(rmsSum / rmsCnt);
    state[S.rmsSum] = rmsSum;
    state[S.rmsCnt] = rmsCnt;
  }
}
