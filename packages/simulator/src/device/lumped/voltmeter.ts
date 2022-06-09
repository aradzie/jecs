import { Device, DeviceState, EvalOptions } from "../../circuit/device.js";
import type { Node } from "../../circuit/network.js";

const enum S {
  /** Current through probe. */
  V,
  Vmax,
  Vmin,
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
  }

  override endEval(state: DeviceState, options: EvalOptions): void {
    const { np, nn } = this;
    const V = np.voltage - nn.voltage;
    const Vmax = state[S.Vmax];
    const Vmin = state[S.Vmin];
    state[S.V] = V;
    state[S.Vmax] = Vmax === Vmax ? Math.max(Vmax, V) : V;
    state[S.Vmin] = Vmin === Vmin ? Math.min(Vmin, V) : V;
  }
}
