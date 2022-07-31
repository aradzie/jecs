import { DcParams, Device, DeviceState, TrParams } from "../../circuit/device.js";
import { Stamper, stampVoltageSource } from "../../circuit/mna.js";
import type { Branch, Network, Node } from "../../circuit/network.js";
import { Properties } from "../../circuit/properties.js";

const enum S {
  gain,
  V,
  I,
  _Size_,
}

/**
 * Current-controlled voltage source.
 */
export class CCVS extends Device {
  static override readonly id = "CCVS";
  static override readonly numTerminals = 4;
  static override readonly propertiesSchema = {
    gain: Properties.number({ title: "gain" }),
  };
  static override readonly stateSchema = {
    length: S._Size_,
    ops: [
      { index: S.V, name: "V", unit: "V" },
      { index: S.I, name: "I", unit: "A" },
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
  private branch1!: Branch;
  /** Extra MNA branch. */
  private branch2!: Branch;

  override connect(network: Network, [np, nn, ncp, ncn]: readonly Node[]): void {
    this.np = np;
    this.nn = nn;
    this.ncp = ncp;
    this.ncn = ncn;
    this.branch1 = network.makeBranch(this.np, this.nn);
    this.branch2 = network.makeBranch(this.ncp, this.ncn);
  }

  override init(state: DeviceState): void {
    state[S.gain] = this.properties.getNumber("gain");
  }

  override initDc(state: DeviceState, params: DcParams): void {}

  override loadDc(state: DeviceState, params: DcParams, stamper: Stamper): void {
    const { np, nn, branch1, ncp, ncn, branch2 } = this;
    const gain = state[S.gain];
    stampVoltageSource(stamper, np, nn, branch1, 0);
    stampVoltageSource(stamper, ncp, ncn, branch2, 0);
    stamper.stampA(branch1, branch2, -gain);
  }

  override endDc(state: DeviceState, params: DcParams): void {
    const { np, nn, branch1 } = this;
    const V = np.voltage - nn.voltage;
    const I = branch1.current;
    state[S.V] = V;
    state[S.I] = I;
  }

  override initTr(state: DeviceState, params: TrParams): void {
    this.initDc(state, params);
  }

  override loadTr(state: DeviceState, params: TrParams, stamper: Stamper): void {
    this.loadDc(state, params, stamper);
  }

  override endTr(state: DeviceState, params: TrParams): void {
    this.endDc(state, params);
  }
}
