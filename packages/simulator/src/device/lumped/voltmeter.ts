import { Device, DeviceState, EvalParams } from "../../circuit/device.js";
import type { Network, Node } from "../../circuit/network.js";

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
  private np!: Node;
  /** Negative terminal. */
  private nn!: Node;

  override connect(network: Network, [np, nn]: readonly Node[]): void {
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

  override endEval(state: DeviceState, { timeStep }: EvalParams): void {
    const { np, nn } = this;
    const V = np.voltage - nn.voltage;
    state[S.V] = V;
    if (timeStep === timeStep) {
      const Vmax = state[S.Vmax];
      const Vmin = state[S.Vmin];
      const rmsSum = state[S.rmsSum] + V * V;
      const rmsCnt = state[S.rmsCnt] + 1;
      state[S.Vmax] = Vmax === Vmax ? Math.max(Vmax, V) : V;
      state[S.Vmin] = Vmin === Vmin ? Math.min(Vmin, V) : V;
      state[S.Vrms] = Math.sqrt(rmsSum / rmsCnt);
      state[S.rmsSum] = rmsSum;
      state[S.rmsCnt] = rmsCnt;
    }
  }
}
