import { Device, DeviceState, EvalParams } from "../../circuit/device.js";
import type { Node, Stamper } from "../../circuit/network.js";
import { Properties } from "../../circuit/properties.js";

const enum S {
  amplitude,
  omega,
  theta,
  I,
  V,
  P,
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
      { index: S.P, name: "P", unit: "W" },
    ],
  };

  /** Positive terminal. */
  readonly np: Node;
  /** Negative terminal. */
  readonly nn: Node;

  constructor(id: string, [np, nn]: readonly Node[]) {
    super(id, [np, nn]);
    this.np = np;
    this.nn = nn;
  }

  override deriveState(state: DeviceState): void {
    const amplitude = this.properties.getNumber("I");
    const frequency = this.properties.getNumber("f");
    const phase = this.properties.getNumber("phase");
    const omega = 2 * Math.PI * frequency;
    const theta = (phase / 180) * Math.PI;
    state[S.amplitude] = amplitude;
    state[S.omega] = omega;
    state[S.theta] = theta;
  }

  override beginEval(state: DeviceState, { elapsedTime, sourceFactor }: EvalParams): void {
    const amplitude = state[S.amplitude];
    const omega = state[S.omega];
    const theta = state[S.theta];
    state[S.I] = sourceFactor * amplitude * Math.sin(omega * elapsedTime + theta);
  }

  override stamp(state: DeviceState, stamper: Stamper): void {
    const { np, nn } = this;
    const I = state[S.I];
    stamper.stampCurrentSource(np, nn, I);
  }

  override endEval(state: DeviceState): void {
    const { np, nn } = this;
    const V = np.voltage - nn.voltage;
    const I = state[S.I];
    const P = V * I;
    state[S.V] = V;
    state[S.P] = P;
  }
}
