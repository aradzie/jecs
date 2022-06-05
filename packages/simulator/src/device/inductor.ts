import { Device, DeviceState, EvalOptions, StateParams } from "../circuit/device.js";
import { CircuitError } from "../circuit/error.js";
import type { Branch, Network, Node, Stamper } from "../circuit/network.js";
import { Params, ParamsSchema } from "../circuit/params.js";

export interface InductorParams {
  readonly L: number;
}

const enum S {
  L,
  V,
  I,
  P,
  Req,
  Veq,
  _Size_,
}

/**
 * Inductor.
 */
export class Inductor extends Device<InductorParams> {
  static override readonly id = "L";
  static override readonly numTerminals = 2;
  static override readonly paramsSchema: ParamsSchema<InductorParams> = {
    L: Params.number({
      title: "inductance",
    }),
  };
  static override readonly stateParams: StateParams = {
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
  /** Extra MNA branch. */
  private branch!: Branch;

  constructor(id: string, [na, nb]: readonly Node[], params: InductorParams | null = null) {
    super(id, [na, nb], params);
    this.na = na;
    this.nb = nb;
  }

  override connect(network: Network): void {
    this.branch = network.makeBranch(this.na, this.nb);
  }

  override deriveState(state: DeviceState, { L }: InductorParams): void {
    if (L === 0) {
      throw new CircuitError(`Zero valued inductor`);
    }
    state[S.L] = L;
  }

  override beginEval(state: DeviceState, options: EvalOptions): void {
    const { branch } = this;
    const { timeStep } = options;
    const L = state[S.L];
    const I = branch.current;
    if (timeStep !== timeStep) {
      // DC analysis.
      state[S.Req] = 0;
      state[S.Veq] = 0;
    } else {
      // Transient analysis.
      const Req = L / timeStep;
      const Veq = -I * Req;
      state[S.Req] = Req;
      state[S.Veq] = Veq;
    }
  }

  override stamp(state: DeviceState, stamper: Stamper): void {
    const { na, nb, branch } = this;
    const Req = state[S.Req];
    const Veq = state[S.Veq];
    stamper.stampMatrix(branch, branch, -Req);
    stamper.stampVoltageSource(na, nb, branch, Veq);
  }

  override endEval(state: DeviceState, options: EvalOptions) {
    const { branch } = this;
    const { timeStep } = options;
    const I = branch.current;
    if (timeStep !== timeStep) {
      // DC analysis.
      state[S.V] = 0;
      state[S.I] = I;
      state[S.P] = 0;
    } else {
      // Transient analysis.
      const Req = state[S.Req];
      const Veq = state[S.Veq];
      const V = I * Req + Veq;
      const P = V * I;
      state[S.V] = V;
      state[S.I] = I;
      state[S.P] = P;
    }
  }
}
