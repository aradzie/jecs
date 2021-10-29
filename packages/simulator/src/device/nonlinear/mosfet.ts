import { Device } from "../../circuit/device";
import type { Node, Stamper } from "../../circuit/network";
import type { Op } from "../../circuit/ops";
import { DeviceModel, Params, ParamsItem } from "../../circuit/params";
import { Unit } from "../../util/unit";
import { Temp } from "../const";
import {
  FetPolarity,
  fetSign,
  fetVoltageDS,
  fetVoltageGSGD,
  nfet,
  pfet,
  PN,
} from "./semi";

export interface MosfetParams {
  readonly polarity: FetPolarity;
  readonly Vth: number;
  readonly beta: number;
  readonly lambda: number;
  readonly Is: number;
  readonly N: number;
  readonly Temp: number;
}

interface MosfetState {
  /** Bulk-source diode voltage. */
  Vbs: number;
  /** Bulk-source diode current. */
  Ibs: number;
  /** Bulk-source diode conductance. */
  Gbs: number;
  /** Bulk-drain diode voltage. */
  Vbd: number;
  /** Bulk-drain diode current. */
  Ibd: number;
  /** Bulk-drain diode conductance. */
  Gbd: number;
  /** Mosfet gate-source voltage. */
  Vgs: number;
  /** Mosfet gate-drain voltage. */
  Vgd: number;
  /** Mosfet drain-source voltage. */
  Vds: number;
  /** Mosfet drain-source current. */
  Ids: number;
  /** Mosfet drain-source conductance. */
  Gds: number;
  /** Mosfet transconductance. */
  Gm: number;
}

/**
 * Metal–oxide–semiconductor field-effect transistor, MOSFET.
 */
export class Mosfet extends Device<MosfetParams, MosfetState> {
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
  static override readonly paramsSchema: Record<
    keyof MosfetParams, //
    ParamsItem
  > = {
    polarity: Params.enum({
      values: [nfet, pfet],
      title: "transistor polarity",
    }),
    Vth: Params.number({
      default: 2.0,
      title: "threshold voltage",
    }),
    beta: Params.number({
      default: 2e-2,
      title: "transconductance parameter",
    }),
    lambda: Params.number({
      default: 0.0,
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
    Temp: Params.number({
      default: Temp,
      title: "device temperature",
    }),
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

  constructor(
    name: string,
    [ns, ng, nd, nb]: readonly Node[],
    params: MosfetParams,
  ) {
    super(name, [ns, ng, nd, nb], params);
    this.ns = ns;
    this.ng = ng;
    this.nd = nd;
    this.nb = nb;
    const { Is, N, Temp } = this.params;
    this.pnBs = new PN(Is, N, Temp);
    this.pnBd = new PN(Is, N, Temp);
  }

  override getInitialState(): MosfetState {
    return {
      Vbs: 0,
      Ibs: 0,
      Gbs: 0,
      Vbd: 0,
      Ibd: 0,
      Gbd: 0,
      Vgs: 0,
      Vgd: 0,
      Vds: 0,
      Ids: 0,
      Gds: 0,
      Gm: 0,
    };
  }

  override eval(state: MosfetState): void {
    const { ns, ng, nd, nb, params, pnBs, pnBd } = this;
    const { polarity, Vth, beta, lambda } = params;
    const sign = fetSign(polarity);

    // DIODES

    const Vbs = (state.Vbs = pnBs.limitVoltage(
      sign * (nb.voltage - ns.voltage),
      state.Vbs,
    ));
    state.Ibs = pnBs.evalCurrent(Vbs);
    state.Gbs = pnBs.evalConductance(Vbs);

    const Vbd = (state.Vbd = pnBd.limitVoltage(
      sign * (nb.voltage - nd.voltage),
      state.Vbd,
    ));
    state.Ibd = pnBs.evalCurrent(Vbd);
    state.Gbd = pnBs.evalConductance(Vbd);

    // FET

    let Vgs = (state.Vgs = sign * (ng.voltage - ns.voltage));
    let Vgd = (state.Vgd = sign * (ng.voltage - nd.voltage));

    if (Vgs >= Vgd) {
      Vgs = state.Vgs = fetVoltageGSGD(Vgs, state.Vgs, sign * Vth);
      const Vds = (state.Vds = fetVoltageDS(Vgs - Vgd, state.Vds));

      // Normal mode.
      const Vgst = Vgs - sign * Vth;
      if (Vgst <= 0) {
        // Cutoff region.
        state.Ids = 0;
        state.Gds = 0;
        state.Gm = 0;
      } else {
        const c0 = lambda * Vds;
        const c1 = beta * (1 + c0);
        if (Vgst <= Vds) {
          // Saturation region.
          state.Ids = (1 / 2) * c1 * Vgst * Vgst;
          state.Gds = (1 / 2) * beta * lambda * Vgst * Vgst;
          state.Gm = c1 * Vgst;
        } else {
          // Linear region.
          state.Ids = c1 * Vds * (Vgst - Vds / 2);
          state.Gds = c1 * (Vgst - Vds) + beta * c0 * (Vgst - Vds / 2);
          state.Gm = c1 * Vds;
        }
      }
    } else {
      Vgd = state.Vgd = fetVoltageGSGD(Vgd, state.Vgd, sign * Vth);
      const Vsd = -(state.Vds = -fetVoltageDS(Vgd - Vgs, -state.Vds));

      // Inverse mode.
      const Vgdt = Vgd - sign * Vth;
      if (Vgdt <= 0) {
        // Cutoff region.
        state.Ids = 0;
        state.Gds = 0;
        state.Gm = 0;
      } else {
        const c0 = lambda * Vsd;
        const c1 = beta * (1 + c0);
        if (Vgdt <= Vsd) {
          // Saturation region.
          state.Ids = -(1 / 2) * c1 * Vgdt * Vgdt;
          state.Gds = (1 / 2) * beta * lambda * Vgdt * Vgdt;
          state.Gm = c1 * Vgdt;
        } else {
          // Linear region.
          state.Ids = -c1 * Vsd * (Vgdt - Vsd / 2);
          state.Gds = c1 * Vgdt + beta * c0 * (Vgdt - Vsd / 2);
          state.Gm = c1 * Vsd;
        }
      }
    }
  }

  override stamp(
    stamper: Stamper,
    {
      Vbs,
      Ibs,
      Gbs,
      Vbd,
      Ibd,
      Gbd,
      Vgs,
      Vgd,
      Vds,
      Ids,
      Gds,
      Gm, //
    }: MosfetState,
  ): void {
    const { ns, ng, nd, nb, params } = this;
    const { polarity } = params;
    const sign = fetSign(polarity);

    // DIODES

    stamper.stampConductance(nb, ns, Gbs);
    stamper.stampCurrentSource(nb, ns, sign * (Ibs - Gbs * Vbs));

    stamper.stampConductance(nb, nd, Gbd);
    stamper.stampCurrentSource(nb, nd, sign * (Ibd - Gbd * Vbd));

    // FET

    if (Vgs >= Vgd) {
      stamper.stampConductance(nd, ns, Gds);
      stamper.stampMatrix(nd, ng, Gm);
      stamper.stampMatrix(nd, ns, -Gm);
      stamper.stampMatrix(ns, ng, -Gm);
      stamper.stampMatrix(ns, ns, Gm);
      stamper.stampCurrentSource(nd, ns, sign * (Ids - Gds * Vds - Gm * Vgs));
    } else {
      stamper.stampConductance(nd, ns, Gds);
      stamper.stampMatrix(nd, ng, Gm);
      stamper.stampMatrix(nd, nd, -Gm);
      stamper.stampMatrix(ns, ng, -Gm);
      stamper.stampMatrix(ns, nd, Gm);
      stamper.stampCurrentSource(nd, ns, sign * (Ids - Gds * Vds - Gm * Vgd));
    }
  }

  override ops(
    {
      Vbs,
      Ibs,
      Gbs,
      Vbd,
      Ibd,
      Gbd,
      Vgs,
      Vgd,
      Vds,
      Ids,
      Gds,
      Gm,
    }: MosfetState = this.state,
  ): readonly Op[] {
    const { params } = this;
    const { polarity } = params;
    const sign = fetSign(polarity);
    return [
      { name: "Vgs", value: sign * Vgs, unit: Unit.VOLT },
      { name: "Vds", value: sign * Vds, unit: Unit.VOLT },
      { name: "Ids", value: sign * Ids, unit: Unit.AMPERE },
    ];
  }
}
