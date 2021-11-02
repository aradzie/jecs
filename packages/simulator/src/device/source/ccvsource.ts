import { Device, StateParams } from "../../circuit/device";
import type { Branch, Network, Node, Stamper } from "../../circuit/network";
import type { Op } from "../../circuit/ops";
import { Params, ParamsSchema } from "../../circuit/params";
import { Unit } from "../../util/unit";

export interface CCVSourceParams {
  readonly gain: number;
}

/**
 * Current-controlled voltage source.
 */
export class CCVSource extends Device<CCVSourceParams> {
  static override readonly id = "CCVS";
  static override readonly numTerminals = 4;
  static override readonly paramsSchema: ParamsSchema<CCVSourceParams> = {
    gain: Params.number({ title: "gain" }),
  };
  static override readonly stateParams: StateParams = {
    length: 0,
    outputs: [],
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
  private branch1!: Branch;
  /** Extra MNA branch. */
  private branch2!: Branch;

  constructor(id: string, [np, nn, ncp, ncn]: readonly Node[], params: CCVSourceParams) {
    super(id, [np, nn, ncp, ncn], params);
    this.np = np;
    this.nn = nn;
    this.ncp = ncp;
    this.ncn = ncn;
  }

  override connect(network: Network): void {
    this.branch1 = network.allocBranch(this.np, this.nn);
    this.branch2 = network.allocBranch(this.ncp, this.ncn);
  }

  override stamp(stamper: Stamper): void {
    const { params, np, nn, branch1, ncp, ncn, branch2 } = this;
    const { gain } = params;
    stamper.stampVoltageSource(np, nn, branch1, 0);
    stamper.stampVoltageSource(ncp, ncn, branch2, 0);
    stamper.stampMatrix(branch1, branch2, -gain);
  }

  override ops(): readonly Op[] {
    const { np, nn, branch1 } = this;
    const voltage = np.voltage - nn.voltage;
    const current = branch1.current;
    const power = voltage * current;
    return [
      { name: "Vd", value: voltage, unit: Unit.VOLT },
      { name: "I", value: current, unit: Unit.AMPERE },
      { name: "P", value: power, unit: Unit.WATT },
    ];
  }
}
