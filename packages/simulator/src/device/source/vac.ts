import { Device, DeviceState, EvalParams } from "../../circuit/device.js";
import { AcStamper, Stamper, stampVoltageSource, stampVoltageSourceAc } from "../../circuit/mna.js";
import type { Branch, Network, Node } from "../../circuit/network.js";
import { Properties } from "../../circuit/properties.js";

const enum S {
  amplitude,
  omega,
  theta,
  V,
  I,
  _Size_,
}

/**
 * AC voltage source.
 */
export class Vac extends Device {
  static override readonly id = "Vac";
  static override readonly numTerminals = 2;
  static override readonly stateSize = S._Size_;
  static override readonly propertiesSchema = {
    V: Properties.number({ title: "amplitude" }),
    f: Properties.number({ title: "frequency" }),
    phase: Properties.number({ title: "phase", defaultValue: 0 }),
  };

  override readonly probes = [
    { name: "V", unit: "V", measure: () => this.state[S.V] },
    { name: "I", unit: "A", measure: () => this.state[S.I] },
  ];

  /** Positive terminal. */
  private np!: Node;
  /** Negative terminal. */
  private nn!: Node;
  /** Extra MNA branch. */
  private branch!: Branch;

  override connect(network: Network, [np, nn]: readonly Node[]): void {
    this.np = np;
    this.nn = nn;
    this.branch = network.makeBranch(this.np, this.nn);
  }

  override deriveState(state: DeviceState): void {
    const amplitude = this.properties.getNumber("V");
    const frequency = this.properties.getNumber("f");
    const phase = this.properties.getNumber("phase");
    const omega = 2 * Math.PI * frequency;
    const theta = (phase / 180) * Math.PI;
    state[S.amplitude] = amplitude;
    state[S.omega] = omega;
    state[S.theta] = theta;
  }

  override eval(
    state: DeviceState,
    { elapsedTime, sourceFactor }: EvalParams,
    stamper: Stamper,
  ): void {
    const { np, nn, branch } = this;
    const amplitude = state[S.amplitude];
    const omega = state[S.omega];
    const theta = state[S.theta];
    const V = sourceFactor * amplitude * Math.sin(omega * elapsedTime + theta);
    state[S.V] = V;
    stampVoltageSource(stamper, np, nn, branch, V);
  }

  override endEval(state: DeviceState): void {
    const { branch } = this;
    const I = branch.current;
    state[S.I] = I;
  }

  override loadAc(state: DeviceState, frequency: number, stamper: AcStamper): void {
    const { np, nn, branch } = this;
    const amplitude = state[S.amplitude];
    const theta = state[S.theta];
    const Vr = amplitude * Math.cos(theta);
    const Vi = amplitude * Math.sin(theta);
    stampVoltageSourceAc(stamper, np, nn, branch, Vr, Vi);
  }
}
