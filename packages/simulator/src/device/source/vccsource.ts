import { Device, DeviceState, EvalOptions } from "../../circuit/device.js";
import type { Branch, Network, Node, Stamper } from "../../circuit/network.js";
import { Properties } from "../../circuit/properties.js";

const enum S {
  gain,
  I,
  V,
  P,
  _Size_,
}

/**
 * Voltage-controlled current source.
 */
export class VCCSource extends Device {
  static override readonly id = "VCCS";
  static override readonly numTerminals = 4;
  static override readonly propertiesSchema = {
    gain: Properties.number({ title: "gain" }),
  };
  static override readonly stateSchema = {
    length: S._Size_,
    ops: [
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

  constructor(id: string, [np, nn, ncp, ncn]: readonly Node[]) {
    super(id, [np, nn, ncp, ncn]);
    this.np = np;
    this.nn = nn;
    this.ncp = ncp;
    this.ncn = ncn;
  }

  override connect(network: Network): void {
    this.branch = network.makeBranch(this.np, this.nn);
  }

  override deriveState(state: DeviceState): void {
    state[S.gain] = this.properties.getNumber("gain");
  }

  override stamp(state: DeviceState, stamper: Stamper): void {
    const { np, nn, ncp, ncn, branch } = this;
    const gain = state[S.gain];
    stamper.stampMatrix(np, branch, 1);
    stamper.stampMatrix(nn, branch, -1);
    stamper.stampMatrix(branch, ncp, gain);
    stamper.stampMatrix(branch, ncn, -gain);
    stamper.stampMatrix(branch, branch, -1);
  }

  override endEval(state: DeviceState, options: EvalOptions): void {
    const { np, nn, branch } = this;
    const I = branch.current;
    const V = np.voltage - nn.voltage;
    const P = V * I;
    state[S.I] = I;
    state[S.V] = V;
    state[S.P] = P;
  }
}
