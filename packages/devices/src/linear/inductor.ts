import {
  type Branch,
  type ComplexStamper,
  type DcParams,
  Device,
  type DeviceState,
  Diff,
  type Network,
  type Node,
  Props,
  type RealStamper,
  type TrParams,
} from "@jecs/simulator";

const enum S {
  L,
  I0,
  V,
  I,
  _Size_,
}

/**
 * Inductor.
 */
export class Inductor extends Device {
  static override readonly id = "L";
  static override readonly numTerminals = 2;
  static override readonly propsSchema = {
    L: Props.number({
      title: "inductance",
      range: ["real", ">", 0],
    }),
    I0: Props.number({
      title: "initial current",
      defaultValue: 0,
    }),
  };
  static override readonly stateSchema = {
    length: S._Size_,
    ops: [
      { index: S.V, name: "V", unit: "V" },
      { index: S.I, name: "I", unit: "A" },
    ],
  };

  private readonly diff = new Diff();

  /** First terminal. */
  private na!: Node;
  /** Second terminal. */
  private nb!: Node;
  /** Extra MNA branch. */
  private branch!: Branch;

  constructor(id: string) {
    super(id);
    this.diffs.push(this.diff);
  }

  override connect(network: Network, [na, nb]: readonly Node[]): void {
    this.na = na;
    this.nb = nb;
    this.branch = network.makeBranch(this.na, this.nb);
  }

  override init(props: Props, state: DeviceState, analysis: "dc" | "ac"): void {
    this.branch.enabled = analysis !== "ac";
  }

  override reset(props: Props, state: DeviceState): void {
    state[S.L] = props.getNumber("L");
    state[S.I0] = props.getNumber("I0");
  }

  override loadDc(state: DeviceState, params: DcParams, stamper: RealStamper): void {
    const { na, nb, branch } = this;
    stamper.stampVoltageSource(na, nb, branch, 0);
  }

  override saveDc(state: DeviceState, params: DcParams): void {
    const { branch } = this;
    state[S.V] = 0;
    state[S.I] = branch.current;
  }

  override loadTr(state: DeviceState, { time }: TrParams, stamper: RealStamper): void {
    const { diff, na, nb, branch } = this;
    const L = state[S.L];
    const I = time > 0 ? branch.current : state[S.I0];
    diff.diff(I, L);
    state[S.V] = diff.I;
    state[S.I] = diff.V;
    stamper.stampA(branch, branch, -diff.Geq);
    stamper.stampVoltageSource(na, nb, branch, diff.Ieq);
  }

  override loadAc(state: DeviceState, frequency: number, stamper: ComplexStamper): void {
    const { na, nb } = this;
    const L = state[S.L];
    const Y = -1 / (2 * Math.PI * frequency * L);
    stamper.stampConductance(na, nb, 0, Y);
  }
}
