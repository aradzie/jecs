import { Device, DeviceState, EvalOptions, StateParams } from "../../circuit/device.js";
import type { Node, Stamper } from "../../circuit/network.js";
import { Params, ParamsSchema } from "../../circuit/params.js";
import type { Form, Signal } from "./signal.js";
import { makeSignal } from "./signal.js";

export interface CSourceParams {
  readonly I: Form;
}

const enum S {
  I,
  V,
  P,
  _Size_,
}

/**
 * Current source.
 */
export class CSource extends Device<CSourceParams> {
  static override readonly id = "I";
  static override readonly numTerminals = 2;
  static override readonly paramsSchema: ParamsSchema<CSourceParams> = {
    I: Params.number({ title: "current" }),
  };
  static override readonly stateParams: StateParams = {
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
  /** Signal generator. */
  private signal!: Signal;

  constructor(
    id: string, //
    [np, nn]: readonly Node[],
    params: CSourceParams | null = null,
  ) {
    super(id, [np, nn], params);
    this.np = np;
    this.nn = nn;
    this.signal = makeSignal(params?.I || 0);
  }

  override beginEval(state: DeviceState, { elapsedTime }: EvalOptions): void {
    state[S.I] = this.signal(elapsedTime || 0);
  }

  override stamp(state: DeviceState, stamper: Stamper): void {
    const { np, nn } = this;
    const I = state[S.I];
    stamper.stampCurrentSource(np, nn, I);
  }

  override endEval(state: DeviceState, options: EvalOptions) {
    const { np, nn } = this;
    const V = np.voltage - nn.voltage;
    const I = state[S.I];
    const P = V * I;
    state[S.V] = V;
    state[S.P] = P;
  }
}
