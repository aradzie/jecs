import { Device, DeviceState, EvalOptions } from "../../circuit/device.js";
import type { Node } from "../../circuit/network.js";

const enum S {
  /** Current through probe. */
  V,
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
      { index: S.V, name: "V", unit: "V" }, //
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

  override endEval(state: DeviceState, options: EvalOptions): void {
    const { np, nn } = this;
    state[S.V] = np.voltage - nn.voltage;
  }
}
