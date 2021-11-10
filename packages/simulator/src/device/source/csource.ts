import { Device, DeviceState, EvalOptions, StateParams } from "../../circuit/device";
import type { Node, Stamper } from "../../circuit/network";
import { Params, ParamsSchema } from "../../circuit/params";

export interface CSourceParams {
  readonly I: number;
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

  constructor(
    id: string, //
    [np, nn]: readonly Node[],
    params: CSourceParams | null = null,
  ) {
    super(id, [np, nn], params);
    this.np = np;
    this.nn = nn;
  }

  override deriveState(state: DeviceState, { I }: CSourceParams): void {
    state[S.I] = I;
  }

  override eval(state: DeviceState, options: EvalOptions): void {
    const { np, nn } = this;
    const I = state[S.I];
    const V = np.voltage - nn.voltage;
    const P = V * I;
    state[S.V] = V;
    state[S.P] = P;
  }

  override stamp(state: DeviceState, stamper: Stamper): void {
    const { np, nn } = this;
    const I = state[S.I];
    stamper.stampCurrentSource(np, nn, I);
  }
}
