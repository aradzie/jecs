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
import { method } from "../integration.js";

const enum S {
  C,
  V0,
  V,
  I,
  Geq,
  Ieq,
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

  /** First terminal. */
  private na!: Node;
  /** Second terminal. */
  private nb!: Node;

  override connect(network: Network, [na, nb]: readonly Node[]): void {
    this.na = na;
    this.nb = nb;
  }

  override init(state: DeviceState): void {
    state[S.C] = this.properties.getNumber("C");
    state[S.V0] = this.properties.getNumber("V0");
  }

  override initDc(state: DeviceState, params: DcParams): void {}

  override loadDc(state: DeviceState, params: DcParams, stamper: Stamper): void {}

  override endDc(state: DeviceState, params: DcParams): void {
    const { na, nb } = this;
    const V = na.voltage - nb.voltage;
    state[S.V] = V;
    state[S.I] = 0;
  }

  override initTr(state: DeviceState, { elapsedTime, timeStep }: TrParams): void {
    const { na, nb } = this;
    const C = state[S.C];
    const V = elapsedTime > 0 ? na.voltage - nb.voltage : state[S.V0];
    let Geq: number;
    let Ieq: number;
    switch (method) {
      case "euler": {
        Geq = C / timeStep;
        Ieq = -V * Geq;
        break;
      }
      case "trapezoidal": {
        const I = state[S.I];
        Geq = (2 * C) / timeStep;
        Ieq = -V * Geq - I;
        break;
      }
    }
    state[S.Geq] = Geq;
    state[S.Ieq] = Ieq;
  }

  override loadTr(state: DeviceState, params: TrParams, stamper: Stamper): void {
    const { na, nb } = this;
    const Geq = state[S.Geq];
    const Ieq = state[S.Ieq];
    stampConductance(stamper, na, nb, Geq);
    stampCurrentSource(stamper, na, nb, Ieq);
  }

  override endTr(state: DeviceState, params: TrParams): void {
    const { na, nb } = this;
    const V = na.voltage - nb.voltage;
    const Geq = state[S.Geq];
    const Ieq = state[S.Ieq];
    const I = V * Geq + Ieq;
    state[S.V] = V;
    state[S.I] = I;
  }

  override loadAc(state: DeviceState, frequency: number, stamper: AcStamper): void {
    const { na, nb } = this;
    const C = state[S.C];
    const Y = 2 * Math.PI * frequency * C;
    stampConductanceAc(stamper, na, nb, 0, Y);
  }
}
