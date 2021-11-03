import { Device, DeviceState, StateParams } from "../../circuit/device";
import type { Branch, Network, Node, Stamper } from "../../circuit/network";
import { Params, ParamsSchema } from "../../circuit/params";

export interface VSourceParams {
  readonly V: number;
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

  constructor(
    id: string, //
    [np, nn]: readonly Node[],
    params: VSourceParams | null = null,
  ) {
    super(id, [np, nn], params);
    this.np = np;
    this.nn = nn;
  }

  override connect(network: Network): void {
    this.branch = network.makeBranch(this.np, this.nn);
  }

  override deriveState({ V }: VSourceParams, state: DeviceState): void {
    state[S.V] = V;
  }

  override eval(state: DeviceState, final: boolean): void {
    const { branch } = this;
    const V = state[S.V];
    const I = branch.current;
    const P = V * I;
    state[S.I] = I;
    state[S.P] = P;
  }

  override stamp(stamper: Stamper, state: DeviceState): void {
    const { np, nn, branch } = this;
    const V = state[S.V];
    stamper.stampVoltageSource(np, nn, branch, V);
  }
}
