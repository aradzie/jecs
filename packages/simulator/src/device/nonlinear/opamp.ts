import { Device, DeviceState } from "../../circuit/device.js";
import type { Branch, Network, Node, Stamper } from "../../circuit/network.js";
import { Properties } from "../../circuit/properties.js";
import { gMin, piOverTwo, twoOverPi } from "../const.js";

const enum S {
  gain,
  Vmax,
  Vin,
  Vout,
  gv,
  _Size_,
}

/**
 * Ideal operational amplifier.
 */
export class OpAmp extends Device {
  static override readonly id = "OpAmp";
  static override readonly numTerminals = 3;
  static override readonly propertiesSchema = {
    gain: Properties.number({
      defaultValue: 1e6,
      range: ["real", ">", 0],
      title: "gain",
    }),
    Vmax: Properties.number({
      defaultValue: 15,
      range: ["real", ">", 0],
      title: "maximum absolute value of output voltage",
    }),
  };
  static override readonly stateSchema = {
    length: S._Size_,
    ops: [
      { index: S.Vin, name: "Vin", unit: "V" },
      { index: S.Vout, name: "Vout", unit: "V" },
    ],
  };
  static override readonly linear = false;

  /** Positive input terminal. */
  private np!: Node;
  /** Negative input terminal. */
  private nn!: Node;
  /** Output terminal. */
  private no!: Node;
  /** Extra MNA branch. */
  private branch!: Branch;

  override connect(network: Network, [np, nn, no]: readonly Node[]): void {
    this.np = np;
    this.nn = nn;
    this.no = no;
    this.branch = network.makeBranch(this.no, network.groundNode);
  }

  override deriveState(state: DeviceState): void {
    const gain = this.properties.getNumber("gain");
    const Vmax = this.properties.getNumber("Vmax");
    state[S.gain] = gain;
    state[S.Vmax] = Vmax;
  }

  override eval(state: DeviceState): void {
    const { np, nn } = this;
    const gain = state[S.gain];
    const Vmax = state[S.Vmax];
    const Vin = np.voltage - nn.voltage;
    const c = (piOverTwo * gain * Vin) / Vmax;
    const Vout = Vmax * twoOverPi * Math.atan(c);
    const gv = gain / (1 + c * c) + gMin;
    state[S.Vin] = Vin;
    state[S.Vout] = Vout;
    state[S.gv] = gv;
  }

  override stamp(state: DeviceState, stamper: Stamper): void {
    const { np, nn, no, branch } = this;
    const Vin = state[S.Vin];
    const Vout = state[S.Vout];
    const gv = state[S.gv];
    stamper.stampMatrix(no, branch, 1);
    stamper.stampMatrix(branch, np, gv);
    stamper.stampMatrix(branch, nn, -gv);
    stamper.stampMatrix(branch, no, -1);
    stamper.stampRightSide(branch, gv * Vin - Vout);
  }
}
