import { DcParams, Device, DeviceState, TrParams } from "../../circuit/device.js";
import {
  AcStamper,
  stampConductance,
  stampConductanceAc,
  stampCurrentSource,
  Stamper,
} from "../../circuit/mna.js";
import type { Network, Node } from "../../circuit/network.js";
import { Properties } from "../../circuit/properties.js";
import { Diff } from "../../circuit/transient.js";

const enum S {
  C,
  V0,
  V,
  I,
  _Size_,
}

/**
 * Capacitor.
 */
export class Capacitor extends Device {
  static override readonly id = "C";
  static override readonly numTerminals = 2;
  static override readonly propertiesSchema = {
    C: Properties.number({
      title: "capacitance",
      range: ["real", ">", 0],
    }),
    V0: Properties.number({
      title: "initial voltage",
      defaultValue: 0,
    }),
  };
  static override readonly stateSchema = {
    length: S._Size_,
    ops: [
      { index: S.V, name: "V", unit: "V" },
      { index: S.I, name: "I", unit: "A" },
    ],
  };

  private readonly diff = new Diff();

  /** First terminal. */
  private na!: Node;
  /** Second terminal. */
  private nb!: Node;

  constructor(id: string) {
    super(id);
    this.diffs.push(this.diff);
  }

  override connect(network: Network, [na, nb]: readonly Node[]): void {
    this.na = na;
    this.nb = nb;
  }

  override init(state: DeviceState): void {
    state[S.C] = this.properties.getNumber("C");
    state[S.V0] = this.properties.getNumber("V0");
  }

  override endDc(state: DeviceState, params: DcParams): void {
    const { na, nb } = this;
    state[S.V] = na.voltage - nb.voltage;
    state[S.I] = 0;
  }

  override loadTr(state: DeviceState, { time }: TrParams, stamper: Stamper): void {
    const { diff, na, nb } = this;
    const C = state[S.C];
    const V = time > 0 ? na.voltage - nb.voltage : state[S.V0];
    diff.diff(V, C);
    state[S.V] = diff.V;
    state[S.I] = diff.I;
    stampConductance(stamper, na, nb, diff.Geq);
    stampCurrentSource(stamper, na, nb, diff.Ieq);
  }

  override loadAc(state: DeviceState, frequency: number, stamper: AcStamper): void {
    const { na, nb } = this;
    const C = state[S.C];
    const Y = 2 * Math.PI * frequency * C;
    stampConductanceAc(stamper, na, nb, 0, Y);
  }
}
