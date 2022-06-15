import { Device, DeviceState } from "../../circuit/device.js";
import type { Branch, Network, Node, Stamper } from "../../circuit/network.js";
import { Properties } from "../../circuit/properties.js";

const enum S {
  V,
  I,
  P,
  _Size_,
}

/**
 * Voltage source.
 */
export class Vdc extends Device {
  static override readonly id = "V";
  static override readonly numTerminals = 2;
  static override readonly propertiesSchema = {
    V: Properties.number({ title: "voltage" }),
  };
  static override readonly stateSchema = {
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

  constructor(id: string, [np, nn]: readonly Node[]) {
    super(id, [np, nn]);
    this.np = np;
    this.nn = nn;
  }

  override connect(network: Network): void {
    this.branch = network.makeBranch(this.np, this.nn);
  }

  override deriveState(state: DeviceState): void {
    state[S.V] = this.properties.getNumber("V");
  }

  override stamp(state: DeviceState, stamper: Stamper): void {
    const { np, nn, branch } = this;
    const V = state[S.V];
    stamper.stampVoltageSource(np, nn, branch, V);
  }

  override endEval(state: DeviceState): void {
    const { branch } = this;
    const I = branch.current;
    const V = state[S.V];
    const P = V * I;
    state[S.I] = I;
    state[S.P] = P;
  }
}