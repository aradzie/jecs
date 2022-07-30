import { Device, DeviceState, EvalParams } from "../../circuit/device.js";
import { Stamper, stampVoltageSource } from "../../circuit/mna.js";
import type { Branch, Network, Node } from "../../circuit/network.js";
import { Properties } from "../../circuit/properties.js";

const enum S {
  gain,
  I,
  V,
  P,
  _Size_,
}

/**
 * Current-controlled current source.
 */
export class CCCS extends Device {
  static override readonly id = "CCCS";
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
    this.branch = network.makeBranch(this.ncp, this.ncn);
  }

  override deriveState(state: DeviceState): void {
    state[S.gain] = this.properties.getNumber("gain");
  }

  override eval(state: DeviceState, params: EvalParams, stamper: Stamper): void {
    const { np, nn, ncp, ncn, branch } = this;
    const gain = state[S.gain];
    stampVoltageSource(stamper, ncp, ncn, branch, 0);
    stamper.stampA(np, branch, gain);
    stamper.stampA(nn, branch, -gain);
  }

  override endEval(state: DeviceState): void {
    const { np, nn, branch } = this;
    const gain = state[S.gain];
    const I = branch.current * gain;
    const V = np.voltage - nn.voltage;
    const P = V * I;
    state[S.I] = I;
    state[S.V] = V;
    state[S.P] = P;
  }
}
