import {
  celsiusToKelvin,
  type DcParams,
  Device,
  type DeviceState,
  type Network,
  type Node,
  Props,
  type RealStamper,
} from "@jecs/simulator";
import { Eg, gMin, k, q, Tnom, Xti } from "../const.js";
import {
  coalesce,
  type FetPolarity,
  fetSign,
  mosfetVoltage,
  nfet,
  pfet,
  pnConductance,
  pnCurrent,
  pnVoltage,
} from "./semi.js";

const enum S {
  /** Device polarity, +1 for nfet, -1 for pfet. */
  pol,
  /** Threshold voltage. */
  Vth,
  /** Transconductance parameter. */
  beta,
  /** Channel-length modulation parameter. */
  lambda,
  /** Saturation current. */
  Is,
  /** Emission coefficient. */
  N,
  /** Device temperature. */
  temp,
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
export class Mosfet extends Device.Dc {
  static override readonly id = "MOSFET";
  static override readonly numTerminals = 4;
  static override readonly propsSchema = {
    polarity: Props.string({
      range: [nfet, pfet],
      title: "transistor polarity",
    }),
    Vth: Props.number({
      range: ["real"],
      title: "threshold voltage",
    }),
    beta: Props.number({
      defaultValue: 2e-2,
      range: ["real", ">", 0],
      title: "transconductance parameter",
    }),
    lambda: Props.number({
      defaultValue: 0.0,
      range: ["real", ">=", 0],
      title: "channel-length modulation parameter",
    }),
    Is: Props.number({
      defaultValue: 1e-14,
      range: ["real", ">", 0],
      title: "saturation current",
    }),
    N: Props.number({
      defaultValue: 1,
      range: ["real", ">", 0],
      title: "emission coefficient",
    }),
    temp: Props.temp,
  };
  static override readonly stateSchema = {
    length: S._Size_,
    ops: [
      { index: S.Vgs, name: "Vgs", unit: "V" },
      { index: S.Vgd, name: "Vgd", unit: "V" },
      { index: S.Vds, name: "Vds", unit: "V" },
      { index: S.Ids, name: "Ids", unit: "A" },
      // { index: S.Gm, name: "gm", unit: "A/V" },
    ],
  };
  static override readonly linear = false;

  /** The source terminal. */
  private ns!: Node;
  /** The gate terminal. */
  private ng!: Node;
  /** The drain terminal. */
  private nd!: Node;
  /** The body terminal. */
  private nb!: Node;

  override connect(network: Network, [ns, ng, nd, nb]: readonly Node[]): void {
    this.ns = ns;
    this.ng = ng;
    this.nd = nd;
    this.nb = nb;
  }

  override reset(props: Props, state: DeviceState): void {
    const polarity = props.getString("polarity") as FetPolarity;
    const Vth = props.getNumber("Vth");
    const beta = props.getNumber("beta");
    const lambda = props.getNumber("lambda");
    const Is = props.getNumber("Is");
    const N = props.getNumber("N");
    const temp = props.getNumber("temp", NaN);

    state[S.pol] = fetSign(polarity);
    state[S.Vth] = Vth;
    state[S.beta] = beta;
    state[S.lambda] = lambda;
    state[S.Is] = Is;
    state[S.N] = N;
    state[S.temp] = temp;
  }

  override loadDc(state: DeviceState, { temp }: DcParams, stamper: RealStamper): void {
    const { ns, ng, nd, nb } = this;

    this.#eval(state, temp, true);

    const pol = state[S.pol];
    const Vbs = pol * state[S.Vbs];
    const Vbd = pol * state[S.Vbd];
    const Vgs = pol * state[S.Vgs];
    const Vgd = pol * state[S.Vgd];
    const Vds = pol * state[S.Vds];
    const Ibs = pol * state[S.Ibs];
    const Gbs = state[S.Gbs];
    const Ibd = pol * state[S.Ibd];
    const Gbd = state[S.Gbd];
    const Ids = pol * state[S.Ids];
    const Gds = state[S.Gds];
    const Gm = state[S.Gm];

    // DIODES

    stamper.stampConductance(nb, ns, Gbs);
    stamper.stampCurrentSource(nb, ns, pol * (Ibs - Gbs * Vbs));

    stamper.stampConductance(nb, nd, Gbd);
    stamper.stampCurrentSource(nb, nd, pol * (Ibd - Gbd * Vbd));

    // FET

    if (Vds > 0) {
      stamper.stampConductance(nd, ns, Gds);
      stamper.stampTransconductance(nd, ns, ng, ns, Gm);
      stamper.stampCurrentSource(nd, ns, pol * (Ids - Gds * Vds - Gm * Vgs));
    } else {
      stamper.stampConductance(nd, ns, Gds);
      stamper.stampTransconductance(nd, ns, ng, nd, Gm);
      stamper.stampCurrentSource(nd, ns, pol * (Ids - Gds * Vds - Gm * Vgd));
    }
  }

  override saveDc(state: DeviceState, { temp }: DcParams): void {
    this.#eval(state, temp, false);
  }

  #eval(state: DeviceState, globalTemp: number, damped: boolean): void {
    const { ns, ng, nd, nb } = this;

    const pol = state[S.pol];
    const Vth = state[S.Vth];
    const beta = state[S.beta];
    const lambda = state[S.lambda];
    const Is = state[S.Is];
    const N = state[S.N];
    const temp = celsiusToKelvin(coalesce(state[S.temp], globalTemp));

    const t = temp / Tnom;
    const Vt = N * temp * (k / q);

    let Vbs = pol * (nb.voltage - ns.voltage);
    let Vbd = pol * (nb.voltage - nd.voltage);
    let Vgs = (state[S.Vgs] = pol * (ng.voltage - ns.voltage));
    let Vgd = (state[S.Vgd] = pol * (ng.voltage - nd.voltage));
    let Vds = Vgs - Vgd;
    if (damped) {
      const Ist = Is * Math.pow(t, Xti / N) * Math.exp((t - 1) * (Eg / Vt));
      const Vcrit = Vt * Math.log(Vt / Math.sqrt(2) / Ist);
      Vbs = pnVoltage(Vbs, pol * state[S.Vbs], Vt, Vcrit);
      Vbd = pnVoltage(Vbd, pol * state[S.Vbd], Vt, Vcrit);
      if (Vds > 0) {
        Vgs = mosfetVoltage(Vgs, pol * state[S.Vgs]);
        Vds = mosfetVoltage(Vgs - Vgd, pol * state[S.Vds]);
      } else {
        Vgd = mosfetVoltage(Vgd, pol * state[S.Vgd]);
        Vds = mosfetVoltage(Vgs - Vgd, pol * state[S.Vds]);
      }
    }

    // DIODES

    const Ibs = pnCurrent(Vbs, Is, Vt);
    const Gbs = pnConductance(Vbs, Is, Vt) + gMin;
    const Ibd = pnCurrent(Vbd, Is, Vt);
    const Gbd = pnConductance(Vbd, Is, Vt) + gMin;

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
        Gds = gMin;
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
        Gds = gMin;
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
}
