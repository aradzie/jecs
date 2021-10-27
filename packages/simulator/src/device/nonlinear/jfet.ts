import { Device } from "../../circuit/device";
import type { Node, Stamper } from "../../circuit/network";
import type { Op } from "../../circuit/ops";
import { Params } from "../../circuit/params";
import { Unit } from "../../util/unit";
import { Temp } from "../const";
import { FetPolarity, fetSign, nfet, pfet, PN } from "./semi";

export interface JfetParams {
  readonly polarity: FetPolarity;
  readonly Temp: number;
  readonly Vth: number;
  readonly beta: number;
  readonly lambda: number;
  readonly Is: number;
  readonly N: number;
}

interface JfetState {
  prevVgs: number;
  prevVgd: number;
}

/**
 * Junction field-effect transistor, JFET.
 */
export class Jfet extends Device<JfetParams, JfetState> {
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
      default: -4,
      title: "threshold voltage",
    }),
    beta: Params.number({
      default: 0.00125,
      title: "transconductance parameter",
    }),
    lambda: Params.number({
      default: 0,
      title: "channel-length modulation parameter",
    }),
    Is: Params.number({
      default: 1e-14,
      title: "saturation current",
    }),
    N: Params.number({
      default: 1,
      title: "emission coefficient",
    }),
  };

  /** The source terminal. */
  readonly ns: Node;
  /** The gate terminal. */
  readonly ng: Node;
  /** The drain terminal. */
  readonly nd: Node;
  /** The gate-source PN junction of BJT. */
  private readonly pnGs: PN;
  /** The gate-drain PN junction of BJT. */
  private readonly pnGd: PN;

  constructor(name: string, [ns, ng, nd]: readonly Node[], params: JfetParams) {
    super(name, [ns, ng, nd], params);
    this.ns = ns;
    this.ng = ng;
    this.nd = nd;
    const { Temp, Is, N } = this.params;
    this.pnGs = new PN(Temp, Is, N);
    this.pnGd = new PN(Temp, Is, N);
  }

  override stamp(stamper: Stamper, state: JfetState): void {
    const { ns, ng, nd, params, pnGs, pnGd } = this;
    const { polarity, Vth, beta, lambda } = params;
    const sign = fetSign(polarity);
    const Vgs = (state.prevVgs = pnGs.limitVoltage(
      sign * (ng.voltage - ns.voltage),
      state.prevVgs,
    ));
    const Vgd = (state.prevVgd = pnGd.limitVoltage(
      sign * (ng.voltage - nd.voltage),
      state.prevVgd,
    ));
    const Vds = Vgs - Vgd;
    const Vsd = Vgd - Vgs;

    // FET

    let Ids;
    let eqGds;
    let eqGm;
    if (Vds >= 0) {
      // Normal mode.
      const Vgst = Vgs - Vth;
      if (Vgst <= 0) {
        // Cutoff region.
        Ids = 0;
        eqGds = 0;
        eqGm = 0;
      } else {
        const c0 = lambda * Vds;
        const c1 = beta * (1 + c0);
        if (Vgst <= Vds) {
          // Saturation region.
          Ids = c1 * Vgst * Vgst;
          eqGds = beta * lambda * Vgst * Vgst;
          eqGm = 2 * c1 * Vgst;
        } else {
          // Linear region.
          Ids = c1 * Vds * (2 * Vgst - Vds);
          eqGds = 2 * c1 * (Vgst - Vds) + beta * c0 * (2 * Vgst - Vds);
          eqGm = 2 * c1 * Vds;
        }
      }
    } else {
      // Inverse mode.
      const Vgdt = Vgd - Vth;
      if (Vgdt <= 0) {
        // Cutoff region.
        Ids = 0;
        eqGds = 0;
        eqGm = 0;
      } else {
        const c0 = lambda * Vsd;
        const c1 = beta * (1 + c0);
        if (Vgdt <= Vsd) {
          // Saturation region.
          Ids = -c1 * Vgdt * Vgdt;
          eqGds = beta * lambda * Vgdt * Vgdt + 2 * c1 * Vgdt;
          eqGm = -2 * c1 * Vgdt;
        } else {
          // Linear region.
          Ids = -c1 * Vsd * (2 * Vgdt - Vsd);
          eqGds = 2 * c1 * Vgdt + beta * c0 * (2 * Vgdt - Vsd);
          eqGm = -2 * c1 * Vsd;
        }
      }
    }
    const eqIds = Ids - eqGds * Vds - eqGm * Vgs;

    stamper.stampConductance(nd, ns, eqGds);
    stamper.stampMatrix(nd, ng, eqGm);
    stamper.stampMatrix(nd, ns, -eqGm);
    stamper.stampMatrix(ns, ng, -eqGm);
    stamper.stampMatrix(ns, ns, eqGm);
    stamper.stampCurrentSource(nd, ns, sign * eqIds);

    // DIODES

    const Igs = pnGs.evalCurrent(Vgs);
    const eqGgs = pnGs.evalConductance(Vgs);
    const Igd = pnGs.evalCurrent(Vgd);
    const eqGgd = pnGs.evalConductance(Vgd);

    const eqIgs = Igs - eqGgs * Vgs;
    const eqIgd = Igd - eqGgd * Vgd;

    stamper.stampConductance(ng, ns, eqGgs);
    stamper.stampConductance(ng, nd, eqGgd);
    stamper.stampCurrentSource(ng, ns, sign * eqIgs);
    stamper.stampCurrentSource(ng, nd, sign * eqIgd);
  }

  override ops(): readonly Op[] {
    const { ns, ng, nd, params, pnGs, pnGd } = this;
    const { polarity, Vth, beta, lambda } = params;
    const sign = fetSign(polarity);
    const Vgs = sign * (ng.voltage - ns.voltage);
    const Vgd = sign * (ng.voltage - nd.voltage);
    const Vds = Vgs - Vgd;
    const Vsd = Vgd - Vgs;
    let Ids;
    if (Vds >= 0) {
      // Normal mode.
      const Vgst = Vgs - Vth;
      if (Vgst <= 0) {
        // Cutoff region.
        Ids = 0;
      } else {
        const c0 = lambda * Vds;
        const c1 = beta * (1 + c0);
        if (Vgst <= Vds) {
          // Saturation region.
          Ids = c1 * Vgst * Vgst;
        } else {
          // Linear region.
          Ids = c1 * Vds * (2 * Vgst - Vds);
        }
      }
    } else {
      // Inverse mode.
      const Vgdt = Vgd - Vth;
      if (Vgdt <= 0) {
        // Cutoff region.
        Ids = 0;
      } else {
        const c0 = lambda * Vsd;
        const c1 = beta * (1 + c0);
        if (Vgdt <= Vsd) {
          // Saturation region.
          Ids = -c1 * Vgdt * Vgdt;
        } else {
          // Linear region.
          Ids = -c1 * Vsd * (2 * Vgdt - Vsd);
        }
      }
    }
    const Igs = pnGs.evalCurrent(Vgs);
    const Igd = pnGd.evalCurrent(Vgd);
    return [
      { name: "Vgs", value: sign * Vgs, unit: Unit.VOLT },
      { name: "Vds", value: sign * Vds, unit: Unit.VOLT },
      { name: "Ids", value: sign * Ids, unit: Unit.AMPERE },
    ];
  }
}
