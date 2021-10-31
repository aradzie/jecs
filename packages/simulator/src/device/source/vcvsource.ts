import { Device, StateParams } from "../../circuit/device";
import type { Branch, Network, Node, Stamper } from "../../circuit/network";
import type { Op } from "../../circuit/ops";
import { Params, ParamsSchema } from "../../circuit/params";
import { Unit } from "../../util/unit";

export interface VCVSourceParams {
  readonly gain: number;
}

/**
 * Voltage-controlled voltage source.
 */
export class VCVSource extends Device<VCVSourceParams> {
  static override readonly id = "VCVS";
  static override readonly numTerminals = 4;
  static override readonly paramsSchema: ParamsSchema<VCVSourceParams> = {
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
  private branch!: Branch;

  constructor(name: string, [np, nn, ncp, ncn]: readonly Node[], params: VCVSourceParams) {
    super(name, [np, nn, ncp, ncn], params);
    this.np = np;
    this.nn = nn;
    this.ncp = ncp;
    this.ncn = ncn;
  }

  override connect(network: Network): void {
    this.branch = network.allocBranch(this.np, this.nn);
  }

  override stamp(stamper: Stamper): void {
    const { np, nn, ncp, ncn, branch, params } = this;
    const { gain } = params;
    stamper.stampVoltageSource(np, nn, branch, 0);
    stamper.stampMatrix(branch, ncp, -gain);
    stamper.stampMatrix(branch, ncn, gain);
  }

  override ops(): readonly Op[] {
    const { np, nn, branch } = this;
    const voltage = np.voltage - nn.voltage;
    const current = branch.current;
    const power = voltage * current;
    return [
      { name: "Vd", value: voltage, unit: Unit.VOLT },
      { name: "I", value: current, unit: Unit.AMPERE },
      { name: "P", value: power, unit: Unit.WATT },
    ];
  }
}
