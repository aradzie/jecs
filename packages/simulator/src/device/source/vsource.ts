import { Device, DeviceState, EvalOptions, StateParams } from "../../circuit/device.js";
import type { Branch, Network, Node, Stamper } from "../../circuit/network.js";
import { Params, ParamsSchema } from "../../circuit/params.js";
import type { Form, Signal } from "./signal.js";
import { makeSignal } from "./signal.js";

export interface VSourceParams {
  readonly V: Form;
}

const enum S {
  V,
  I,
  P,
  _Size_,
}

/**
 * Voltage source.
 */
export class VSource extends Device<VSourceParams> {
  static override readonly id = "V";
  static override readonly numTerminals = 2;
  static override readonly paramsSchema: ParamsSchema<VSourceParams> = {
    V: Params.number({ title: "voltage" }),
  };
  static override readonly stateParams: StateParams = {
    length: S._Size_,
    ops: [
      { index: S.V, name: "V", unit: "V" },
      { index: S.I, name: "I", unit: "A" },
      { index: S.P, name: "P", unit: "W" },
    ],
  };

  /** Positive terminal. */
  readonly np: Node;
  /** Negative terminal. */
  readonly nn: Node;
  /** Extra MNA branch. */
  private branch!: Branch;
  /** Signal generator. */
  private signal!: Signal;

  constructor(
    id: string, //
    [np, nn]: readonly Node[],
    params: VSourceParams | null = null,
  ) {
    super(id, [np, nn], params);
    this.np = np;
    this.nn = nn;
    this.signal = makeSignal(params?.V || 0);
  }

  override connect(network: Network): void {
    this.branch = network.makeBranch(this.np, this.nn);
  }

  override beginEval(state: DeviceState, { elapsedTime }: EvalOptions): void {
    state[S.V] = this.signal(elapsedTime || 0);
  }

  override stamp(state: DeviceState, stamper: Stamper): void {
    const { np, nn, branch } = this;
    const V = state[S.V];
    stamper.stampVoltageSource(np, nn, branch, V);
  }

  override endEval(state: DeviceState, options: EvalOptions) {
    const { branch } = this;
    const I = branch.current;
    const V = state[S.V];
    const P = V * I;
    state[S.I] = I;
    state[S.P] = P;
  }
}
