import { Device, DeviceState } from "../../circuit/device.js";
import type { Node, Stamper } from "../../circuit/network.js";
import { Properties } from "../../circuit/properties.js";

const enum S {
  G,
  V,
  I,
  P,
  _Size_,
}

/**
 * Resistor.
 */
export class Resistor extends Device {
  static override readonly id = "R";
  static override readonly numTerminals = 2;
  static override readonly propertiesSchema = {
    R: Properties.number({
      title: "resistance",
      range: ["real", "<>", 0],
    }),
  };
  static override readonly stateSchema = {
    length: S._Size_,
    ops: [
      { index: S.V, name: "V", unit: "V" },
      { index: S.I, name: "I", unit: "A" },
      { index: S.P, name: "P", unit: "W" },
    ],
  };

  /** First terminal. */
  readonly na: Node;
  /** Second terminal. */
  readonly nb: Node;

  constructor(id: string, [na, nb]: readonly Node[]) {
    super(id, [na, nb]);
    this.na = na;
    this.nb = nb;
  }

  override deriveState(state: DeviceState): void {
    const R = this.properties.getNumber("R");
    state[S.G] = 1 / R;
  }

  override stamp(state: DeviceState, stamper: Stamper): void {
    const { na, nb } = this;
    const G = state[S.G];
    stamper.stampConductance(na, nb, G);
  }

  override endEval(state: DeviceState): void {
    const { na, nb } = this;
    const G = state[S.G];
    const V = na.voltage - nb.voltage;
    const I = V * G;
    const P = V * I;
    state[S.V] = V;
    state[S.I] = I;
    state[S.P] = P;
  }
}
