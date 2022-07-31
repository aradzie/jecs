import { DcParams, Device, DeviceState, TrParams } from "../../circuit/device.js";
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
  static override readonly propertiesSchema = {
    gain: Properties.number({ title: "gain" }),
  };
  static override readonly stateSchema = {
    length: S._Size_,
    ops: [
      { index: S.I, name: "I", unit: "A" },
      { index: S.V, name: "V", unit: "V" },
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
    this.branch = network.makeBranch(this.np, this.nn);
  }

  override init(state: DeviceState): void {
    state[S.gain] = this.properties.getNumber("gain");
  }

  override initDc(state: DeviceState, params: DcParams): void {}

  override loadDc(state: DeviceState, params: DcParams, stamper: Stamper): void {
    const { np, nn, ncp, ncn, branch } = this;
    const gain = state[S.gain];
    stamper.stampA(np, branch, 1);
    stamper.stampA(nn, branch, -1);
    stamper.stampA(branch, ncp, gain);
    stamper.stampA(branch, ncn, -gain);
    stamper.stampA(branch, branch, -1);
  }

  override endDc(state: DeviceState, params: DcParams): void {
    const { np, nn, branch } = this;
    const I = branch.current;
    const V = np.voltage - nn.voltage;
    state[S.I] = I;
    state[S.V] = V;
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
