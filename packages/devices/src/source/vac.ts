import {
  type Branch,
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
  static override readonly propsSchema = {
    V: Props.number({ title: "amplitude" }),
    f: Props.number({ title: "frequency" }),
    phase: Props.number({ title: "phase", defaultValue: 0 }),
  };
  static override readonly stateSchema = {
    length: S._Size_,
    ops: [
      { index: S.V, name: "V", unit: "V" },
      { index: S.I, name: "I", unit: "A" },
    ],
  };

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

  override reset(props: Props, state: DeviceState): void {
    const amplitude = props.getNumber("V");
    const frequency = props.getNumber("f");
    const phase = props.getNumber("phase");
    const omega = 2 * Math.PI * frequency;
    const theta = (phase / 180) * Math.PI;
    state[S.amplitude] = amplitude;
    state[S.omega] = omega;
    state[S.theta] = theta;
  }

  override loadDc(state: DeviceState, params: DcParams, stamper: RealStamper): void {
    const { np, nn, branch } = this;
    stamper.stampVoltageSource(np, nn, branch, 0);
  }

  override saveDc(state: DeviceState, params: DcParams): void {
    state[S.V] = 0;
    state[S.I] = 0;
  }

  override loadTr(
    state: DeviceState,
    { time, sourceFactor }: TrParams,
    stamper: RealStamper,
  ): void {
    const { np, nn, branch } = this;
    const amplitude = state[S.amplitude];
    const omega = state[S.omega];
    const theta = state[S.theta];
    const V = sourceFactor * amplitude * Math.sin(omega * time + theta);
    state[S.V] = V;
    stamper.stampVoltageSource(np, nn, branch, V);
  }

  override saveTr(state: DeviceState, params: TrParams): void {
    const { branch } = this;
    const I = branch.current;
    state[S.I] = I;
  }

  override loadAc(state: DeviceState, frequency: number, stamper: ComplexStamper): void {
    const { np, nn, branch } = this;
    const amplitude = state[S.amplitude];
    const theta = state[S.theta];
    const Vr = amplitude * Math.cos(theta);
    const Vi = amplitude * Math.sin(theta);
    stamper.stampVoltageSource(np, nn, branch, Vr, Vi);
  }
}
