import { Device } from "../../circuit/device";
import type { Node, Stamper } from "../../circuit/network";
import type { Op } from "../../circuit/ops";
import { Params } from "../../circuit/params";
import { Unit } from "../../util/unit";
import { Temp } from "../const";
import {
  FetPolarity,
  fetSign,
  fetVoltageGSGD,
  fetVoltageDS,
  nfet,
  pfet,
} from "./semi";

export interface MosfetParams {
  readonly polarity: FetPolarity;
  readonly Temp: number;
  readonly Vth: number;
  readonly beta: number;
  readonly lambda: number;
}

interface MosfetState {
  prevVgs: number;
  prevVgd: number;
  prevVds: number;
}

/**
 * Metal–oxide–semiconductor field-effect transistor, MOSFET.
 */
export class Mosfet extends Device<MosfetParams, MosfetState> {
  static override readonly id = "MOSFET";
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

  /** The source terminal. */
  readonly ns: Node;
  /** The gate terminal. */
  readonly ng: Node;
  /** The drain terminal. */
  readonly nd: Node;

  constructor(
    name: string,
    [ns, ng, nd]: readonly Node[],
    params: MosfetParams,
  ) {
    super(name, [ns, ng, nd], params);
    this.ns = ns;
    this.ng = ng;
    this.nd = nd;
  }

  override stamp(stamper: Stamper, state: MosfetState): void {
    const { ns, ng, nd, params } = this;
    const { polarity, Vth, beta, lambda } = params;
    const sign = fetSign(polarity);
    let Vgs = sign * (ng.voltage - ns.voltage);
    let Vgd = sign * (ng.voltage - nd.voltage);

    // FET

    let Ids;
    let eqGds;
    let eqGm;
    let eqIds;
    if (Vgs >= Vgd) {
      Vgs = state.prevVgs = fetVoltageGSGD(Vgs, state.prevVgs, sign * Vth);
      const Vds = (state.prevVds = fetVoltageDS(Vgs - Vgd, state.prevVds));

      // Normal mode.
      const Vgst = Vgs - sign * Vth;
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
          Ids = (1 / 2) * c1 * Vgst * Vgst;
          eqGds = (1 / 2) * beta * lambda * Vgst * Vgst;
          eqGm = c1 * Vgst;
        } else {
          // Linear region.
          Ids = c1 * Vds * (Vgst - Vds / 2);
          eqGds = c1 * (Vgst - Vds) + beta * c0 * (Vgst - Vds / 2);
          eqGm = c1 * Vds;
        }
      }
      eqIds = Ids - eqGds * Vds - eqGm * Vgs;

      stamper.stampConductance(nd, ns, eqGds);
      stamper.stampMatrix(nd, ng, eqGm);
      stamper.stampMatrix(nd, ns, -eqGm);
      stamper.stampMatrix(ns, ng, -eqGm);
      stamper.stampMatrix(ns, ns, eqGm);
      stamper.stampCurrentSource(nd, ns, sign * eqIds);
    } else {
      Vgd = state.prevVgd = fetVoltageGSGD(Vgd, state.prevVgd, sign * Vth);
      const Vsd = -(state.prevVds = -fetVoltageDS(Vgd - Vgs, -state.prevVds));

      // Inverse mode.
      const Vgdt = Vgd - sign * Vth;
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
          Ids = -(1 / 2) * c1 * Vgdt * Vgdt;
          eqGds = (1 / 2) * beta * lambda * Vgdt * Vgdt;
          eqGm = c1 * Vgdt;
        } else {
          // Linear region.
          Ids = -c1 * Vsd * (Vgdt - Vsd / 2);
          eqGds = c1 * Vgdt + beta * c0 * (Vgdt - Vsd / 2);
          eqGm = c1 * Vsd;
        }
      }
      eqIds = Ids + eqGds * Vsd - eqGm * Vgd;

      stamper.stampConductance(nd, ns, eqGds);
      stamper.stampMatrix(nd, ng, eqGm);
      stamper.stampMatrix(nd, nd, -eqGm);
      stamper.stampMatrix(ns, ng, -eqGm);
      stamper.stampMatrix(ns, nd, eqGm);
      stamper.stampCurrentSource(nd, ns, sign * eqIds);
    }

    // DIODES

    // TODO
  }

  override ops(): readonly Op[] {
    const { ns, ng, nd, params } = this;
    const { polarity, Vth, beta, lambda } = params;
    const sign = fetSign(polarity);
    const Vgs = sign * (ng.voltage - ns.voltage);
    const Vgd = sign * (ng.voltage - nd.voltage);
    const Vds = Vgs - Vgd;
    const Vsd = Vgd - Vgs;
    let Ids;
    if (Vgs >= Vgd) {
      // Normal mode.
      const Vgst = Vgs - sign * Vth;
      if (Vgst <= 0) {
        // Cutoff region.
        Ids = 0;
      } else {
        const c0 = lambda * Vds;
        const c1 = beta * (1 + c0);
        if (Vgst <= Vds) {
          // Saturation region.
          Ids = (1 / 2) * c1 * Vgst * Vgst;
        } else {
          // Linear region.
          Ids = c1 * Vds * (Vgst - Vds / 2);
        }
      }
    } else {
      // Inverse mode.
      const Vgdt = Vgd - sign * Vth;
      if (Vgdt <= 0) {
        // Cutoff region.
        Ids = 0;
      } else {
        const c0 = lambda * Vsd;
        const c1 = beta * (1 + c0);
        if (Vgdt <= Vsd) {
          // Saturation region.
          Ids = -(1 / 2) * c1 * Vgdt * Vgdt;
        } else {
          // Linear region.
          Ids = -c1 * Vsd * (Vgdt - Vsd / 2);
        }
      }
    }
    return [
      { name: "Vgs", value: sign * Vgs, unit: Unit.VOLT },
      { name: "Vds", value: sign * Vds, unit: Unit.VOLT },
      { name: "Ids", value: sign * Ids, unit: Unit.AMPERE },
    ];
  }
}
