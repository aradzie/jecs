import { Device, DeviceState, EvalParams } from "../../circuit/device.js";
import { stampConductance, stampCurrentSource, Stamper } from "../../circuit/mna.js";
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

  override deriveState(state: DeviceState): void {
    state[S.C] = this.properties.getNumber("C");
    state[S.V0] = this.properties.getNumber("V0");
  }

  override beginEval(state: DeviceState, { elapsedTime, timeStep }: EvalParams): void {
    const { na, nb } = this;
    if (timeStep !== timeStep) {
      // DC analysis.
      state[S.Geq] = 0;
      state[S.Ieq] = 0;
    } else {
      // Transient analysis.
      const C = state[S.C];
      let V = na.voltage - nb.voltage;
      if (elapsedTime === 0) {
        V = state[S.V0];
      }
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
  }

  override eval(state: DeviceState, params: EvalParams, stamper: Stamper): void {
    const { na, nb } = this;
    const Geq = state[S.Geq];
    const Ieq = state[S.Ieq];
    stampConductance(stamper, na, nb, Geq);
    stampCurrentSource(stamper, na, nb, Ieq);
  }

  override endEval(state: DeviceState, { timeStep }: EvalParams): void {
    const { na, nb } = this;
    const V = na.voltage - nb.voltage;
    if (timeStep !== timeStep) {
      // DC analysis.
      state[S.V] = V;
      state[S.I] = 0;
    } else {
      // Transient analysis.
      const Geq = state[S.Geq];
      const Ieq = state[S.Ieq];
      const I = V * Geq + Ieq;
      state[S.V] = V;
      state[S.I] = I;
    }
  }
}
