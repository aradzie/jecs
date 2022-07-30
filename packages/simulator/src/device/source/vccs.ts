import { Device, DeviceState, EvalParams } from "../../circuit/device.js";
import type { Stamper } from "../../circuit/mna.js";
import type { Branch, Network, Node } from "../../circuit/network.js";
import { Properties } from "../../circuit/properties.js";

const enum S {
  gain,
  I,
  V,
  _Size_,
}

/**
 * Voltage-controlled current source.
 */
export class VCCS extends Device {
  static override readonly id = "VCCS";
  static override readonly numTerminals = 4;
  static override readonly stateSize = S._Size_;
  static override readonly propertiesSchema = {
    gain: Properties.number({ title: "gain" }),
  };

  override readonly probes = [
    { name: "I", unit: "A", measure: () => this.state[S.I] },
    { name: "V", unit: "V", measure: () => this.state[S.V] },
  ];

  /** Positive output terminal. */
  private np!: Node;
  /** Negative output terminal. */
  private nn!: Node;
  /** Positive control terminal. */
  private ncp!: Node;
  /** Negative control terminal. */
  private ncn!: Node;
  /** Extra MNA branch. */
  private branch!: Branch;

  override connect(network: Network, [np, nn, ncp, ncn]: readonly Node[]): void {
    this.np = np;
    this.nn = nn;
    this.ncp = ncp;
    this.ncn = ncn;
    this.branch = network.makeBranch(this.np, this.nn);
  }

  override deriveState(state: DeviceState): void {
    state[S.gain] = this.properties.getNumber("gain");
  }

  override eval(state: DeviceState, params: EvalParams, stamper: Stamper): void {
    const { np, nn, ncp, ncn, branch } = this;
    const gain = state[S.gain];
    stamper.stampA(np, branch, 1);
    stamper.stampA(nn, branch, -1);
    stamper.stampA(branch, ncp, gain);
    stamper.stampA(branch, ncn, -gain);
    stamper.stampA(branch, branch, -1);
  }

  override endEval(state: DeviceState): void {
    const { np, nn, branch } = this;
    const I = branch.current;
    const V = np.voltage - nn.voltage;
    state[S.I] = I;
    state[S.V] = V;
  }
}
