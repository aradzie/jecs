import { Device, DeviceState, EvalParams } from "../../circuit/device.js";
import { AcStamper, stampConductance, stampConductanceAc, Stamper } from "../../circuit/mna.js";
import type { Network, Node } from "../../circuit/network.js";
import { Properties } from "../../circuit/properties.js";

const enum S {
  G,
  V,
  I,
  _Size_,
}

/**
 * Resistor.
 */
export class Resistor extends Device {
  static override readonly id = "R";
  static override readonly numTerminals = 2;
  static override readonly stateSize = S._Size_;
  static override readonly propertiesSchema = {
    R: Properties.number({
      title: "resistance",
      range: ["real", "<>", 0],
    }),
  };

  override readonly probes = [
    { name: "V", unit: "V", measure: () => this.state[S.V] },
    { name: "I", unit: "A", measure: () => this.state[S.I] },
  ];

  /** First terminal. */
  private na!: Node;
  /** Second terminal. */
  private nb!: Node;

  override connect(network: Network, [na, nb]: readonly Node[]): void {
    this.na = na;
    this.nb = nb;
  }

  override deriveState(state: DeviceState): void {
    const R = this.properties.getNumber("R");
    state[S.G] = 1 / R;
  }

  override eval(state: DeviceState, params: EvalParams, stamper: Stamper): void {
    const { na, nb } = this;
    const G = state[S.G];
    stampConductance(stamper, na, nb, G);
  }

  override endEval(state: DeviceState): void {
    const { na, nb } = this;
    const G = state[S.G];
    const V = na.voltage - nb.voltage;
    const I = V * G;
    state[S.V] = V;
    state[S.I] = I;
  }

  override loadAc(state: DeviceState, frequency: number, stamper: AcStamper): void {
    const { na, nb } = this;
    const G = state[S.G];
    stampConductanceAc(stamper, na, nb, G, 0);
  }
}
