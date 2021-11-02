import { Device, DeviceState, StateParams } from "../../circuit/device";
import type { Branch, Network, Node, Stamper } from "../../circuit/network";
import type { Op } from "../../circuit/ops";
import { Params, ParamsSchema } from "../../circuit/params";
import { Unit } from "../../util/unit";

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
    outputs: [
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

  constructor(id: string, [np, nn]: readonly Node[], params: VSourceParams) {
    super(id, [np, nn], params);
    this.np = np;
    this.nn = nn;
  }

  override connect(network: Network): void {
    this.branch = network.allocBranch(this.np, this.nn);
  }

  override eval(state: DeviceState, final: boolean): void {
    const { params, branch } = this;
    const { V } = params;
    const I = branch.current;
    const P = V * I;
    state[S.V] = V;
    state[S.I] = I;
    state[S.P] = P;
  }

  override stamp(stamper: Stamper, [V, I, P]: DeviceState): void {
    const { np, nn, branch } = this;
    stamper.stampVoltageSource(np, nn, branch, V);
  }

  override ops([V, I, P]: DeviceState = this.state): readonly Op[] {
    return [
      { name: "V", value: V, unit: Unit.VOLT },
      { name: "I", value: I, unit: Unit.AMPERE },
      { name: "P", value: P, unit: Unit.WATT },
    ];
  }
}
