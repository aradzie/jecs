import { Device, DeviceState, EvalParams } from "../../circuit/device.js";
import { AcStamper, stampConductanceAc, Stamper, stampVoltageSource } from "../../circuit/mna.js";
import type { Branch, Network, Node } from "../../circuit/network.js";
import { Properties } from "../../circuit/properties.js";
import { method } from "../integration.js";

const enum S {
  L,
  I0,
  V,
  I,
  Req,
  Veq,
  _Size_,
}

/**
 * Inductor.
 */
export class Inductor extends Device {
  static override readonly id = "L";
  static override readonly numTerminals = 2;
  static override readonly stateSize = S._Size_;
  static override readonly propertiesSchema = {
    L: Properties.number({
      title: "inductance",
      range: ["real", ">", 0],
    }),
    I0: Properties.number({
      title: "initial current",
      defaultValue: 0,
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
  /** Extra MNA branch. */
  private branch!: Branch;

  override connect(network: Network, [na, nb]: readonly Node[]): void {
    this.na = na;
    this.nb = nb;
    this.branch = network.makeBranch(this.na, this.nb);
  }

  override deriveState(state: DeviceState): void {
    state[S.L] = this.properties.getNumber("L");
    state[S.I0] = this.properties.getNumber("I0");
  }

  override beginEval(state: DeviceState, { elapsedTime, timeStep }: EvalParams): void {
    const { branch } = this;
    if (timeStep !== timeStep) {
      // DC analysis.
      state[S.Req] = 0;
      state[S.Veq] = 0;
    } else {
      // Transient analysis.
      const L = state[S.L];
      let I = branch.current;
      if (elapsedTime === 0) {
        I = state[S.I0];
      }
      let Req: number;
      let Veq: number;
      switch (method) {
        case "euler": {
          Req = L / timeStep;
          Veq = -I * Req;
          break;
        }
        case "trapezoidal": {
          const V = state[S.V];
          Req = (2 * L) / timeStep;
          Veq = -I * Req - V;
          break;
        }
      }
      state[S.Req] = Req;
      state[S.Veq] = Veq;
    }
  }

  override eval(state: DeviceState, params: EvalParams, stamper: Stamper): void {
    const { na, nb, branch } = this;
    const Req = state[S.Req];
    const Veq = state[S.Veq];
    stamper.stampA(branch, branch, -Req);
    stampVoltageSource(stamper, na, nb, branch, Veq);
  }

  override endEval(state: DeviceState, { timeStep }: EvalParams): void {
    const { branch } = this;
    const I = branch.current;
    if (timeStep !== timeStep) {
      // DC analysis.
      state[S.V] = 0;
      state[S.I] = I;
    } else {
      // Transient analysis.
      const Req = state[S.Req];
      const Veq = state[S.Veq];
      const V = I * Req + Veq;
      state[S.V] = V;
      state[S.I] = I;
    }
  }

  override loadAc(state: DeviceState, frequency: number, stamper: AcStamper): void {
    const { na, nb } = this;
    const L = state[S.L];
    const Y = -1 / (2 * Math.PI * frequency * L);
    stampConductanceAc(stamper, na, nb, 0, Y);
  }
}
