import { Model } from "../circuit/model.js";
import { Temp } from "../circuit/properties.js";
import { Bjt } from "./nonlinear/bjt.js";
import { Diode } from "./nonlinear/diode.js";
import { Jfet } from "./nonlinear/jfet.js";
import { Mosfet } from "./nonlinear/mosfet.js";

export const standardModels: readonly Model[] = [
  new Model("D", Diode, {
    Is: 1e-14,
    N: 1,
    Temp,
  }),
  new Model("NPN", Bjt, {
    polarity: "npn",
    Bf: 100.0,
    Br: 1.0,
    Is: 1e-14,
    Nf: 1,
    Nr: 1,
    Vaf: 10.0,
    Var: 0.0,
    Temp,
  }),
  new Model("PNP", Bjt, {
    polarity: "pnp",
    Bf: 100.0,
    Br: 1.0,
    Is: 1e-14,
    Nf: 1,
    Nr: 1,
    Vaf: 10.0,
    Var: 0.0,
    Temp,
  }),
  new Model("NFET", Jfet, {
    polarity: "nfet",
    Vth: -2.0,
    beta: 1e-4,
    lambda: 0.0,
    Is: 1e-14,
    N: 1,
    Temp,
  }),
  new Model("PFET", Jfet, {
    polarity: "pfet",
    Vth: -2.0,
    beta: 1e-4,
    lambda: 0.0,
    Is: 1e-14,
    N: 1,
    Temp,
  }),
  new Model("NMOS", Mosfet, {
    polarity: "nfet",
    Vth: +2.0,
    beta: 2e-2,
    lambda: 0.0,
    Is: 1e-14,
    N: 1,
    Temp,
  }),
  new Model("PMOS", Mosfet, {
    polarity: "pfet",
    Vth: -2.0,
    beta: 2e-2,
    lambda: 0.0,
    Is: 1e-14,
    N: 1,
    Temp,
  }),
  new Model("DEPNMOS", Mosfet, {
    polarity: "nfet",
    Vth: -2.0,
    beta: 2e-2,
    lambda: 0.0,
    Is: 1e-14,
    N: 1,
    Temp,
  }),
  new Model("DEPPMOS", Mosfet, {
    polarity: "pfet",
    Vth: +2.0,
    beta: 2e-2,
    lambda: 0.0,
    Is: 1e-14,
    N: 1,
    Temp,
  }),
];
