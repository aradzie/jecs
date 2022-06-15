import { Device, DeviceState } from "../../circuit/device.js";
import type { Node, Stamper } from "../../circuit/network.js";
import { Properties } from "../../circuit/properties.js";

const enum S {
  I,
  V,
  P,
  _Size_,
}

/**
 * Current source.
 */
export class Idc extends Device {
  static override readonly id = "I";
  static override readonly numTerminals = 2;
  static override readonly propertiesSchema = {
    I: Properties.number({ title: "current" }),
  };
  static override readonly stateSchema = {
    length: S._Size_,
    ops: [
      { index: S.I, name: "I", unit: "A" },
      { index: S.V, name: "V", unit: "V" },
      { index: S.P, name: "P", unit: "W" },
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
    state[S.I] = this.properties.getNumber("I");
  }

  override stamp(state: DeviceState, stamper: Stamper): void {
    const { np, nn } = this;
    const I = state[S.I];
    stamper.stampCurrentSource(np, nn, I);
  }

  override endEval(state: DeviceState): void {
    const { np, nn } = this;
    const V = np.voltage - nn.voltage;
    const I = state[S.I];
    const P = V * I;
    state[S.V] = V;
    state[S.P] = P;
  }
}
