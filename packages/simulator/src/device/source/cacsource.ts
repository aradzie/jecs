import { Device, DeviceState, EvalOptions } from "../../circuit/device.js";
import type { Node, Stamper } from "../../circuit/network.js";
import { Properties } from "../../circuit/properties.js";

const enum S {
  offset,
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
export class CacSource extends Device {
  static override readonly id = "Iac";
  static override readonly numTerminals = 2;
  static override readonly propertiesSchema = {
    offset: Properties.number({ title: "offset", default: 0 }),
    amplitude: Properties.number({ title: "amplitude" }),
    frequency: Properties.number({ title: "frequency" }),
    phase: Properties.number({ title: "phase", default: 0 }),
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
    state[S.I] = offset + amplitude * Math.sin(omega * elapsedTime + theta);
  }

  override stamp(state: DeviceState, stamper: Stamper): void {
    const { np, nn } = this;
    const I = state[S.I];
    stamper.stampCurrentSource(np, nn, I);
  }

  override endEval(state: DeviceState, options: EvalOptions): void {
    const { np, nn } = this;
    const V = np.voltage - nn.voltage;
    const I = state[S.I];
    const P = V * I;
    state[S.V] = V;
    state[S.P] = P;
  }
}
