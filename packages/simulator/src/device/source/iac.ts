import { DcParams, Device, DeviceState, TrParams } from "../../circuit/device.js";
import { AcStamper, stampCurrentSource, stampCurrentSourceAc, Stamper } from "../../circuit/mna.js";
import type { Network, Node } from "../../circuit/network.js";
import { Properties } from "../../circuit/properties.js";

const enum S {
  amplitude,
  omega,
  theta,
  I,
  V,
  _Size_,
}

/**
 * AC current source.
 */
export class Iac extends Device {
  static override readonly id = "Iac";
  static override readonly numTerminals = 2;
  static override readonly propertiesSchema = {
    I: Properties.number({ title: "amplitude" }),
    f: Properties.number({ title: "frequency" }),
    phase: Properties.number({ title: "phase", defaultValue: 0 }),
  };
  static override readonly stateSchema = {
    length: S._Size_,
    ops: [
      { index: S.I, name: "I", unit: "A" },
      { index: S.V, name: "V", unit: "V" },
    ],
  };

  /** Positive terminal. */
  private np!: Node;
  /** Negative terminal. */
  private nn!: Node;

  override connect(network: Network, [np, nn]: readonly Node[]): void {
    this.np = np;
    this.nn = nn;
  }

  override init(state: DeviceState): void {
    const amplitude = this.properties.getNumber("I");
    const frequency = this.properties.getNumber("f");
    const phase = this.properties.getNumber("phase");
    const omega = 2 * Math.PI * frequency;
    const theta = (phase / 180) * Math.PI;
    state[S.amplitude] = amplitude;
    state[S.omega] = omega;
    state[S.theta] = theta;
  }

  override initDc(state: DeviceState, params: DcParams): void {}

  override loadDc(state: DeviceState, params: DcParams, stamper: Stamper): void {}

  override endDc(state: DeviceState, params: DcParams): void {
    state[S.I] = 0;
    state[S.V] = 0;
  }

  override initTr(state: DeviceState, params: TrParams): void {}

  override loadTr(
    state: DeviceState,
    { elapsedTime, sourceFactor }: TrParams,
    stamper: Stamper,
  ): void {
    const { np, nn } = this;
    const amplitude = state[S.amplitude];
    const omega = state[S.omega];
    const theta = state[S.theta];
    const I = sourceFactor * amplitude * Math.sin(omega * elapsedTime + theta);
    state[S.I] = I;
    stampCurrentSource(stamper, np, nn, I);
  }

  override endTr(state: DeviceState, params: TrParams): void {
    const { np, nn } = this;
    const V = np.voltage - nn.voltage;
    state[S.V] = V;
  }

  override loadAc(state: DeviceState, frequency: number, stamper: AcStamper): void {
    const { np, nn } = this;
    const amplitude = state[S.amplitude];
    const theta = state[S.theta];
    const Ir = amplitude * Math.cos(theta);
    const Ii = amplitude * Math.sin(theta);
    stampCurrentSourceAc(stamper, np, nn, Ir, Ii);
  }
}
