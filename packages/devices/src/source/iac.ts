import {
  type ComplexStamper,
  type DcParams,
  Device,
  type DeviceState,
  type Network,
  type Node,
  Props,
  type RealStamper,
  type TrParams,
} from "@jecs/simulator";

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
  static override readonly propsSchema = {
    I: Props.number({ title: "amplitude" }),
    f: Props.number({ title: "frequency" }),
    phase: Props.number({ title: "phase", defaultValue: 0 }),
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

  override reset(props: Props, state: DeviceState): void {
    const amplitude = props.getNumber("I");
    const frequency = props.getNumber("f");
    const phase = props.getNumber("phase");
    const omega = 2 * Math.PI * frequency;
    const theta = (phase / 180) * Math.PI;
    state[S.amplitude] = amplitude;
    state[S.omega] = omega;
    state[S.theta] = theta;
  }

  override endDc(state: DeviceState, params: DcParams): void {
    state[S.I] = 0;
    state[S.V] = 0;
  }

  override loadTr(
    state: DeviceState,
    { time, sourceFactor }: TrParams,
    stamper: RealStamper,
  ): void {
    const { np, nn } = this;
    const amplitude = state[S.amplitude];
    const omega = state[S.omega];
    const theta = state[S.theta];
    const I = sourceFactor * amplitude * Math.sin(omega * time + theta);
    state[S.I] = I;
    stamper.stampCurrentSource(np, nn, I);
  }

  override endTr(state: DeviceState, params: TrParams): void {
    const { np, nn } = this;
    state[S.V] = np.voltage - nn.voltage;
  }

  override loadAc(state: DeviceState, frequency: number, stamper: ComplexStamper): void {
    const { np, nn } = this;
    const amplitude = state[S.amplitude];
    const theta = state[S.theta];
    const Ir = amplitude * Math.cos(theta);
    const Ii = amplitude * Math.sin(theta);
    stamper.stampCurrentSource(np, nn, Ir, Ii);
  }
}
