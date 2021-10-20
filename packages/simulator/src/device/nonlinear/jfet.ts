import type { Op } from "../../circuit/ops";
import { Device } from "../../circuit/device";
import type { Node, Stamper } from "../../circuit/network";
import { Params } from "../../circuit/params";
import { Unit } from "../../util/unit";
import { Temp } from "../const";
import { FetPolarity, fetSign, nfet, pfet } from "./semi";

export interface JfetParams {
  readonly polarity: FetPolarity;
  readonly Temp: number;
  readonly Vth: number;
  readonly beta: number;
  readonly lambda: number;
}

/**
 * Junction field-effect transistor, JFET.
 * TODO Complete this device model.
 */
export class Jfet extends Device<JfetParams> {
  static override readonly id = "JFET";
  static override readonly numTerminals = 3;
  static override readonly paramsSchema = {
    polarity: Params.enum({
      values: [nfet, pfet],
      title: "transistor polarity",
    }),
    Temp: Params.number({
      default: Temp,
      title: "device temperature",
    }),
    Vth: Params.number({
      default: 2,
      title: "threshold voltage",
    }),
    beta: Params.number({
      default: 0.02,
      title: "transconductance parameter",
    }),
    lambda: Params.number({
      default: 0,
      title: "channel-length modulation parameter",
    }),
  };

  /** The drain terminal. */
  readonly nd: Node;
  /** The gate terminal. */
  readonly ng: Node;
  /** The source terminal. */
  readonly ns: Node;

  constructor(name: string, [nd, ng, ns]: readonly Node[], params: JfetParams) {
    super(name, [nd, ng, ns], params);
    this.nd = nd;
    this.ng = ng;
    this.ns = ns;
  }

  override stamp(stamper: Stamper): void {
    const { nd, ng, ns, params } = this;
    const { polarity, Vth, beta, lambda } = params;
    const sign = fetSign(polarity); // TODO
    const Vds = nd.voltage - ns.voltage;
    const Vgs = ng.voltage - ns.voltage;
    let Ids;
    let eqGds;
    let eqGm;
    const Vx = Vgs - Vth;
    if (Vds > 0) {
      // TODO
    } else {
      // TODO
    }
    if (Vx < 0) {
      // cut-off
      Ids = 0;
      eqGds = 0;
      eqGm = 0;
    } else {
      const c0 = lambda * Vds;
      const c1 = 1 + c0;
      if (Vds < Vx) {
        // linear
        Ids = beta * c1 * Vds * (Vx - Vds / 2);
        eqGds = beta * c1 * (Vx - Vds) + beta * c0 * (Vx - Vds / 2);
        eqGm = beta * c1 * Vds;
      } else {
        // saturation
        Ids = (beta / 2) * c1 * Vx * Vx;
        eqGds = (beta / 2) * lambda * Vx * Vx;
        eqGm = beta * c1 * Vx;
      }
    }
    const eqIds = Ids - eqGds * Vds - eqGm * Vgs;
    stamper.stampMatrix(nd, nd, eqGds);
    stamper.stampMatrix(nd, ns, -(eqGds + eqGm));
    stamper.stampMatrix(nd, ng, eqGm);
    stamper.stampRightSide(nd, -eqIds);
    stamper.stampMatrix(ns, nd, -eqGds);
    stamper.stampMatrix(ns, ns, eqGds + eqGm);
    stamper.stampMatrix(ns, ng, -eqGm);
    stamper.stampRightSide(ns, eqIds);
  }

  override ops(): readonly Op[] {
    const { nd, ng, ns, params } = this;
    const { polarity, Vth, beta, lambda } = params;
    const sign = fetSign(polarity); // TODO
    const Vds = nd.voltage - ns.voltage;
    const Vgs = ng.voltage - ns.voltage;
    let Ids;
    const Vx = Vgs - Vth;
    if (Vds > 0) {
      // TODO
    } else {
      // TODO
    }
    if (Vx < 0) {
      // cut-off
      Ids = 0;
    } else {
      const c0 = lambda * Vds;
      const c1 = 1 + c0;
      if (Vds < Vx) {
        // linear
        Ids = beta * c1 * Vds * (Vx - Vds / 2);
      } else {
        // saturation
        Ids = (beta / 2) * c1 * Vx * Vx;
      }
    }
    return [
      { name: "Vds", value: Vds, unit: Unit.VOLT },
      { name: "Vgs", value: Vgs, unit: Unit.VOLT },
      { name: "Ids", value: Ids, unit: Unit.AMPERE },
    ];
  }
}
