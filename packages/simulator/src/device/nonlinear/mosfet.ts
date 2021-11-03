import { Device, DeviceState, StateParams } from "../../circuit/device";
import type { DeviceModel } from "../../circuit/library";
import type { Node, Stamper } from "../../circuit/network";
import { Params, ParamsSchema } from "../../circuit/params";
import { Temp } from "../const";
import { FetPolarity, fetSign, limitMosfetVoltage, nfet, pfet, PN } from "./semi";

export interface MosfetParams {
  readonly polarity: FetPolarity;
  readonly Vth: number;
  readonly beta: number;
  readonly lambda: number;
  readonly Is: number;
  readonly N: number;
  readonly Temp: number;
}

const enum S {
  /** Bulk-source diode voltage. */
  Vbs,
  /** Bulk-source diode current. */
  Ibs,
  /** Bulk-source diode conductance. */
  Gbs,
  /** Bulk-drain diode voltage. */
  Vbd,
  /** Bulk-drain diode current. */
  Ibd,
  /** Bulk-drain diode conductance. */
  Gbd,
  /** Mosfet gate-source voltage. */
  Vgs,
  /** Mosfet gate-drain voltage. */
  Vgd,
  /** Mosfet drain-source voltage. */
  Vds,
  /** Mosfet drain-source current. */
  Ids,
  /** Mosfet drain-source conductance. */
  Gds,
  /** Mosfet transconductance. */
  Gm,
  _Size_,
}

/**
 * Metal–oxide–semiconductor field-effect transistor, MOSFET.
 */
export class Mosfet extends Device<MosfetParams> {
  static override getModels(): readonly DeviceModel[] {
    return [
      ["NMOS", Mosfet.modelEnhNMosfet],
      ["PMOS", Mosfet.modelEnhPMosfet],
      ["DEPNMOS", Mosfet.modelDepNMosfet],
      ["DEPPMOS", Mosfet.modelDepPMosfet],
    ];
  }

  static modelEnhNMosfet = Object.freeze<MosfetParams>({
    polarity: "nfet",
    Vth: +2.0,
    beta: 2e-2,
    lambda: 0.0,
    Is: 1e-14,
    N: 1,
    Temp,
  });
  static modelEnhPMosfet = Object.freeze<MosfetParams>({
    polarity: "pfet",
    Vth: -2.0,
    beta: 2e-2,
    lambda: 0.0,
    Is: 1e-14,
    N: 1,
    Temp,
  });
  static modelDepNMosfet = Object.freeze<MosfetParams>({
    polarity: "nfet",
    Vth: -2.0,
    beta: 2e-2,
    lambda: 0.0,
    Is: 1e-14,
    N: 1,
    Temp,
  });
  static modelDepPMosfet = Object.freeze<MosfetParams>({
    polarity: "pfet",
    Vth: +2.0,
    beta: 2e-2,
    lambda: 0.0,
    Is: 1e-14,
    N: 1,
    Temp,
  });

  static override readonly id = "MOSFET";
  static override readonly numTerminals = 4;
  static override readonly paramsSchema: ParamsSchema<MosfetParams> = {
    polarity: Params.enum({
      values: [nfet, pfet],
      title: "transistor polarity",
    }),
    Vth: Params.number({
      title: "threshold voltage",
      min: -100,
      max: +100,
    }),
    beta: Params.number({
      default: 2e-2,
      min: 1e-6,
      title: "transconductance parameter",
    }),
    lambda: Params.number({
      default: 0.0,
      min: 0,
      title: "channel-length modulation parameter",
    }),
    Is: Params.number({
      default: 1e-14,
      min: 0,
      title: "saturation current",
    }),
    N: Params.number({
      default: 1,
      min: 1e-3,
      max: 100,
      title: "emission coefficient",
    }),
    Temp: Params.Temp,
  };
  static override readonly stateParams: StateParams = {
    length: S._Size_,
    ops: [
      { index: S.Vgs, name: "Vgs", unit: "V" },
      { index: S.Vgd, name: "Vgd", unit: "V" },
      { index: S.Vds, name: "Vds", unit: "V" },
      { index: S.Ids, name: "Ids", unit: "A" },
      // { index: S.Gm, name: "gm", unit: "A/V" },
    ],
  };

  /** The source terminal. */
  readonly ns: Node;
  /** The gate terminal. */
  readonly ng: Node;
  /** The drain terminal. */
  readonly nd: Node;
  /** The body terminal. */
  readonly nb: Node;
  /** The body-source PN junction of MOSFET. */
  private readonly pnBs: PN;
  /** The body-drain PN junction of MOSFET. */
  private readonly pnBd: PN;

  constructor(id: string, [ns, ng, nd, nb]: readonly Node[], params: MosfetParams) {
    super(id, [ns, ng, nd, nb], params);
    this.ns = ns;
    this.ng = ng;
    this.nd = nd;
    this.nb = nb;
    const { Is, N, Temp } = this.params;
    this.pnBs = new PN(Is, N, Temp);
    this.pnBd = new PN(Is, N, Temp);
  }

  override eval(state: DeviceState, final: boolean): void {
    const { params, ns, ng, nd, nb, pnBs, pnBd } = this;
    const { polarity, Vth, beta, lambda } = params;
    const pol = fetSign(polarity);

    let Vbs = pol * (nb.voltage - ns.voltage);
    let Vbd = pol * (nb.voltage - nd.voltage);
    let Vgs = (state[S.Vgs] = pol * (ng.voltage - ns.voltage));
    let Vgd = (state[S.Vgd] = pol * (ng.voltage - nd.voltage));
    let Vds = Vgs - Vgd;
    if (!final) {
      Vbs = pnBs.limitVoltage(Vbs, pol * state[S.Vbs]);
      Vbd = pnBd.limitVoltage(Vbd, pol * state[S.Vbd]);
      if (Vds > 0) {
        Vgs = limitMosfetVoltage(Vgs, pol * state[S.Vgs]);
        Vds = limitMosfetVoltage(Vgs - Vgd, pol * state[S.Vds]);
      } else {
        Vgd = limitMosfetVoltage(Vgd, pol * state[S.Vgd]);
        Vds = limitMosfetVoltage(Vgs - Vgd, pol * state[S.Vds]);
      }
    }

    // DIODES

    const Ibs = pnBs.evalCurrent(Vbs);
    const Gbs = pnBs.evalConductance(Vbs);
    const Ibd = pnBs.evalCurrent(Vbd);
    const Gbd = pnBs.evalConductance(Vbd);

    // FET

    let Ids;
    let Gds;
    let Gm;
    if (Vds > 0) {
      // Normal mode.
      const Vgst = Vgs - pol * Vth;
      if (Vgst <= 0) {
        // Cutoff region.
        Ids = 0;
        Gds = 0;
        Gm = 0;
      } else {
        const c0 = lambda * Vds;
        const c1 = beta * (1 + c0);
        if (Vgst <= Vds) {
          // Saturation region.
          Ids = (1 / 2) * c1 * Vgst * Vgst;
          Gds = (1 / 2) * beta * lambda * Vgst * Vgst;
          Gm = c1 * Vgst;
        } else {
          // Linear region.
          Ids = c1 * Vds * (Vgst - Vds / 2);
          Gds = c1 * (Vgst - Vds) + beta * c0 * (Vgst - Vds / 2);
          Gm = c1 * Vds;
        }
      }
    } else {
      // Inverse mode.
      const Vgdt = Vgd - pol * Vth;
      if (Vgdt <= 0) {
        // Cutoff region.
        Ids = 0;
        Gds = 0;
        Gm = 0;
      } else {
        const Vsd = -Vds;
        const c0 = lambda * Vsd;
        const c1 = beta * (1 + c0);
        if (Vgdt <= Vsd) {
          // Saturation region.
          Ids = -(1 / 2) * c1 * Vgdt * Vgdt;
          Gds = (1 / 2) * beta * lambda * Vgdt * Vgdt;
          Gm = c1 * Vgdt;
        } else {
          // Linear region.
          Ids = -c1 * Vsd * (Vgdt - Vsd / 2);
          Gds = c1 * Vgdt + beta * c0 * (Vgdt - Vsd / 2);
          Gm = c1 * Vsd;
        }
      }
    }

    // VOLTAGES

    state[S.Vbs] = pol * Vbs;
    state[S.Vbd] = pol * Vbd;
    state[S.Vgs] = pol * Vgs;
    state[S.Vgd] = pol * Vgd;
    state[S.Vds] = pol * Vds;

    // DIODES

    state[S.Ibs] = pol * Ibs;
    state[S.Gbs] = Gbs;
    state[S.Ibd] = pol * Ibd;
    state[S.Gbd] = Gbd;

    // FET

    state[S.Ids] = pol * Ids;
    state[S.Gds] = Gds;
    state[S.Gm] = Gm;
  }

  override stamp(
    stamper: Stamper,
    [Vbs, Ibs, Gbs, Vbd, Ibd, Gbd, Vgs, Vgd, Vds, Ids, Gds, Gm]: DeviceState,
  ): void {
    const { ns, ng, nd, nb, params } = this;
    const { polarity } = params;
    const pol = fetSign(polarity);

    // DIODES

    stamper.stampConductance(nb, ns, Gbs);
    stamper.stampCurrentSource(nb, ns, pol * (pol * Ibs - pol * Gbs * Vbs));

    stamper.stampConductance(nb, nd, Gbd);
    stamper.stampCurrentSource(nb, nd, pol * (pol * Ibd - pol * Gbd * Vbd));

    // FET

    if (pol * Vds > 0) {
      stamper.stampConductance(nd, ns, Gds);
      stamper.stampMatrix(nd, ng, Gm);
      stamper.stampMatrix(nd, ns, -Gm);
      stamper.stampMatrix(ns, ng, -Gm);
      stamper.stampMatrix(ns, ns, Gm);
      stamper.stampCurrentSource(nd, ns, pol * (pol * Ids - pol * Gds * Vds - pol * Gm * Vgs));
    } else {
      stamper.stampConductance(nd, ns, Gds);
      stamper.stampMatrix(nd, ng, Gm);
      stamper.stampMatrix(nd, nd, -Gm);
      stamper.stampMatrix(ns, ng, -Gm);
      stamper.stampMatrix(ns, nd, Gm);
      stamper.stampCurrentSource(nd, ns, pol * (pol * Ids - pol * Gds * Vds - pol * Gm * Vgd));
    }
  }
}
