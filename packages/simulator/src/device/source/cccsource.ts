import { Device, DeviceState, StateParams } from "../../circuit/device";
import type { Branch, Network, Node, Stamper } from "../../circuit/network";
import type { Op } from "../../circuit/ops";
import { Params, ParamsSchema } from "../../circuit/params";
import { Unit } from "../../util/unit";

export interface CCCSourceParams {
  readonly gain: number;
}

const enum S {
  I,
  V,
  P,
  _Size_,
}

/**
 * Current-controlled current source.
 */
export class CCCSource extends Device<CCCSourceParams> {
  static override readonly id = "CCCS";
  static override readonly numTerminals = 4;
  static override readonly paramsSchema: ParamsSchema<CCCSourceParams> = {
    gain: Params.number({ title: "gain" }),
  };
  static override readonly stateParams: StateParams = {
    length: S._Size_,
    outputs: [
      { index: S.I, name: "I", unit: "A" },
      { index: S.V, name: "V", unit: "V" },
      { index: S.P, name: "P", unit: "W" },
    ],
  };

  /** Positive output terminal. */
  readonly np: Node;
  /** Negative output terminal. */
  readonly nn: Node;
  /** Positive control terminal. */
  readonly ncp: Node;
  /** Negative control terminal. */
  readonly ncn: Node;
  /** Extra MNA branch. */
  private branch!: Branch;

  constructor(id: string, [np, nn, ncp, ncn]: readonly Node[], params: CCCSourceParams) {
    super(id, [np, nn, ncp, ncn], params);
    this.np = np;
    this.nn = nn;
    this.ncp = ncp;
    this.ncn = ncn;
  }

  override connect(network: Network): void {
    this.branch = network.allocBranch(this.ncp, this.ncn);
  }

  override eval(state: DeviceState, final: boolean): void {
    const { params, np, nn, branch } = this;
    const { gain } = params;
    const I = branch.current * gain;
    const V = np.voltage - nn.voltage;
    const P = V * I;
    state[S.I] = I;
    state[S.V] = V;
    state[S.P] = P;
  }

  override stamp(stamper: Stamper): void {
    const { params, np, nn, ncp, ncn, branch } = this;
    const { gain } = params;
    stamper.stampVoltageSource(ncp, ncn, branch, 0);
    stamper.stampMatrix(np, branch, gain);
    stamper.stampMatrix(nn, branch, -gain);
  }

  override ops([I, V, P]: DeviceState = this.state): readonly Op[] {
    return [
      { name: "I", value: I, unit: Unit.AMPERE },
      { name: "V", value: V, unit: Unit.VOLT },
      { name: "P", value: P, unit: Unit.WATT },
    ];
  }
}
