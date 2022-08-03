import { DcParams, Device, DeviceState, TrParams } from "../../circuit/device.js";
import { AcStamper, stampConductanceAc, Stamper, stampVoltageSource } from "../../circuit/mna.js";
import type { Branch, Network, Node } from "../../circuit/network.js";
import { Properties } from "../../circuit/properties.js";
import { Diff } from "../../circuit/transient.js";

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
  static override readonly propertiesSchema = {
    L: Properties.number({
      title: "inductance",
      range: ["real", ">", 0],
    }),
    I0: Properties.number({
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

  override init(state: DeviceState): void {
    state[S.L] = this.properties.getNumber("L");
    state[S.I0] = this.properties.getNumber("I0");
  }

  override loadDc(state: DeviceState, params: DcParams, stamper: Stamper): void {
    const { na, nb, branch } = this;
    stampVoltageSource(stamper, na, nb, branch, 0);
  }

  override endDc(state: DeviceState, params: DcParams): void {
    const { branch } = this;
    state[S.V] = 0;
    state[S.I] = branch.current;
  }

  override loadTr(state: DeviceState, { time }: TrParams, stamper: Stamper): void {
    const { diff, na, nb, branch } = this;
    const L = state[S.L];
    const I = time > 0 ? branch.current : state[S.I0];
    diff.diff(I, L);
    state[S.V] = diff.I;
    state[S.I] = diff.V;
    stamper.stampA(branch, branch, -diff.Geq);
    stampVoltageSource(stamper, na, nb, branch, diff.Ieq);
  }

  override loadAc(state: DeviceState, frequency: number, stamper: AcStamper): void {
    const { na, nb } = this;
    const L = state[S.L];
    const Y = -1 / (2 * Math.PI * frequency * L);
    stampConductanceAc(stamper, na, nb, 0, Y);
  }
}
