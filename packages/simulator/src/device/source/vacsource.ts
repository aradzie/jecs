import { Device, DeviceState, EvalOptions } from "../../circuit/device.js";
import type { Branch, Network, Node, Stamper } from "../../circuit/network.js";
import { Properties } from "../../circuit/properties.js";

const enum S {
  offset,
  amplitude,
  omega,
  theta,
  V,
  I,
  P,
  _Size_,
}

/**
 * AC voltage source.
 */
export class VacSource extends Device {
  static override readonly id = "Vac";
  static override readonly numTerminals = 2;
  static override readonly propertiesSchema = {
    offset: Properties.number({ title: "offset", defaultValue: 0 }),
    amplitude: Properties.number({ title: "amplitude" }),
    frequency: Properties.number({ title: "frequency" }),
    phase: Properties.number({ title: "phase", defaultValue: 0 }),
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
    const offset = this.properties.getNumber("offset");
    const amplitude = this.properties.getNumber("amplitude");
    const frequency = this.properties.getNumber("frequency");
    const phase = this.properties.getNumber("phase");
    const omega = 2 * Math.PI * frequency;
    const theta = (phase / 180) * Math.PI;
    state[S.offset] = offset;
    state[S.amplitude] = amplitude;
    state[S.omega] = omega;
    state[S.theta] = theta;
  }

  override beginEval(state: DeviceState, { elapsedTime }: EvalOptions): void {
    const offset = state[S.offset];
    const amplitude = state[S.amplitude];
    const omega = state[S.omega];
    const theta = state[S.theta];
    state[S.V] = offset + amplitude * Math.sin(omega * elapsedTime + theta);
  }

  override stamp(state: DeviceState, stamper: Stamper): void {
    const { np, nn, branch } = this;
    const V = state[S.V];
    stamper.stampVoltageSource(np, nn, branch, V);
  }

  override endEval(state: DeviceState, options: EvalOptions): void {
    const { branch } = this;
    const I = branch.current;
    const V = state[S.V];
    const P = V * I;
    state[S.I] = I;
    state[S.P] = P;
  }
}
