import { Bjt, Diode, Jfet, Mosfet, OpAmp } from "@jecs/devices";
import { type Symbol } from "../symbol/symbol.ts";
import { arrow } from "../symbol/util.ts";

const diode: Symbol = {
  id: "d",
  name: "Diode",
  category: "Nonlinear",
  prefix: "D",
  shapes: [
    ["l", 0, -30, 0, -10], // top leg
    ["l", -15, -11, 15, -11], // cathode
    ["l", 0, -10, -15, 10], // anode left
    ["l", 0, -10, 15, 10], // anode right
    ["l", -15, 10, 15, 10], // anode bottom
    ["l", 0, 30, 0, 10], // bottom leg
  ],
  pins: [
    ["a", 0, -30],
    ["b", 0, 30],
  ],
  labels: [20, 0, "lm"],
  device: Diode,
};

const zener: Symbol = {
  id: "dz",
  name: "Zener diode",
  category: "Nonlinear",
  prefix: "D",
  shapes: [
    ["l", 0, -30, 0, -10], // top leg
    ["l", -20, -5, -15, -11], // cathode left
    ["l", -15, -11, 15, -11], // cathode
    ["l", 15, -11, 20, -17], // cathode right
    ["l", 0, -10, -15, 10], // anode left
    ["l", 0, -10, 15, 10], // anode right
    ["l", -15, 10, 15, 10], // anode bottom
    ["l", 0, 30, 0, 10], // bottom leg
  ],
  pins: [
    ["a", 0, -30],
    ["b", 0, 30],
  ],
  labels: [20, 0, "lm"],
  device: Diode,
};

const schottky: Symbol = {
  id: "ds",
  name: "Schottky diode",
  category: "Nonlinear",
  prefix: "D",
  shapes: [
    ["l", 0, -30, 0, -10], // top leg
    ["l", -9, -17, -15, -17], // cathode lh
    ["l", -15, -17, -15, -11], // cathode lv
    ["l", -15, -11, 15, -11], // cathode
    ["l", 15, -11, 15, -5], // cathode rv
    ["l", 15, -5, 9, -5], // cathode rh
    ["l", 0, -10, -15, 10], // anode left
    ["l", 0, -10, 15, 10], // anode right
    ["l", -15, 10, 15, 10], // anode bottom
    ["l", 0, 30, 0, 10], // bottom leg
  ],
  pins: [
    ["a", 0, -30],
    ["b", 0, 30],
  ],
  labels: [20, 0, "lm"],
  device: Diode,
};

const varicap: Symbol = {
  id: "dv",
  name: "Varicap diode",
  category: "Nonlinear",
  prefix: "D",
  shapes: [
    ["l", 0, -30, 0, -17], // top leg
    ["l", -15, -17, 15, -17], // plate
    ["l", -15, -11, 15, -11], // cathode
    ["l", 0, -10, -15, 10], // anode left
    ["l", 0, -10, 15, 10], // anode right
    ["l", -15, 10, 15, 10], // anode bottom
    ["l", 0, 30, 0, 10], // bottom leg
  ],
  pins: [
    ["a", 0, -30],
    ["b", 0, 30],
  ],
  labels: [20, 0, "lm"],
  device: Diode,
};

const npn: Symbol = {
  id: "npn",
  name: "NPN bipolar junction transistor",
  category: "Nonlinear",
  prefix: "Q",
  shapes: [
    ["l", 0, -30, 0, -20], // collector leg
    ["l", 0, 30, 0, 20], // emitter leg
    ["l", -30, 0, -20, 0], // base leg
    ["l", -20, -15, -20, 15], // base
    ["l", -20, -5, 0, -20], // collector
    ...arrow(-20, 5, 0, 20),
  ],
  pins: [
    ["c", 0, -30],
    ["e", 0, 30],
    ["b", -30, 0],
  ],
  labels: [10, 0, "lm"],
  device: Bjt,
};

const pnp: Symbol = {
  id: "pnp",
  name: "PNP bipolar junction transistor",
  category: "Nonlinear",
  prefix: "Q",
  shapes: [
    ["l", 0, -30, 0, -20], // emitter leg
    ["l", 0, 30, 0, 20], // collector leg
    ["l", -30, 0, -20, 0], // base leg
    ["l", -20, -15, -20, 15], // base
    ...arrow(0, -20, -20, -5),
    ["l", 0, 20, -20, 5], // collector
  ],
  pins: [
    ["e", 0, -30],
    ["c", 0, 30],
    ["b", -30, 0],
  ],
  labels: [10, 0, "lm"],
  device: Bjt,
};

const nfet: Symbol = {
  id: "nfet",
  name: "N-channel junction field-effect transistor",
  category: "Nonlinear",
  prefix: "Q",
  shapes: [
    ["l", 0, -30, 0, -10], // drain leg
    ["l", 0, 30, 0, 10], // source leg
    ["l", -30, 0, -12, 0], // gate leg
    ["l", 0, -10, -12, -10], // drain
    ["l", 0, 10, -12, 10], // source
    ["l", -12, -15, -12, 15], // gate
    ["l", -21, -5, -15, 0], // arrow top
    ["l", -21, 5, -15, 0], // arrow bottom
  ],
  pins: [
    ["d", 0, -30],
    ["s", 0, 30],
    ["g", -30, 0],
  ],
  labels: [10, 0, "lm"],
  device: Jfet,
};

const pfet: Symbol = {
  id: "pfet",
  name: "P-channel junction field-effect transistor",
  category: "Nonlinear",
  prefix: "Q",
  shapes: [
    ["l", 0, -30, 0, -10], // source leg
    ["l", 0, 30, 0, 10], // drain leg
    ["l", -30, 0, -12, 0], // gate leg
    ["l", 0, -10, -12, -10], // source
    ["l", 0, 10, -12, 10], // drain
    ["l", -12, -15, -12, 15], // gate
    ["l", -21, 0, -15, -5], // arrow top
    ["l", -21, 0, -15, 5], // arrow bottom
  ],
  pins: [
    ["s", 0, -30],
    ["d", 0, 30],
    ["g", -30, 0],
  ],
  labels: [10, 0, "lm"],
  device: Jfet,
};

const nmos: Symbol = {
  id: "nmos",
  name: "N-channel MOS field-effect transistor",
  category: "Nonlinear",
  prefix: "Q",
  shapes: [
    ["l", 0, -30, 0, -10], // drain leg
    ["l", 0, 30, 0, 0], // source leg
    ["l", -30, 0, -20, 0], // gate leg
    ["l", -20, -15, -20, 15], // gate
    ["l", 0, -10, -15, -10], // drain h
    ["l", -15, -15, -15, -6], // drain v
    ["l", 0, 0, -15, 0], // substrate h
    ["l", -15, -3, -15, 3], // substrate v
    ["l", -13, 0, -8, -4], // arrow top
    ["l", -13, 0, -8, 4], // arrow bottom
    ["l", 0, 10, -15, 10], // source h
    ["l", -15, 15, -15, 6], // source v
  ],
  pins: [
    ["d", 0, -30],
    ["s", 0, 30],
    ["g", -30, 0],
  ],
  labels: [10, 0, "lm"],
  device: Mosfet,
};

const pmos: Symbol = {
  id: "pmos",
  name: "P-channel MOS field-effect transistor",
  category: "Nonlinear",
  prefix: "Q",
  shapes: [
    ["l", 0, -30, 0, 0], // source leg
    ["l", 0, 30, 0, 10], // drain leg
    ["l", -30, 0, -20, 0], // gate leg
    ["l", -20, -15, -20, 15], // gate
    ["l", 0, -10, -15, -10], // source h
    ["l", -15, -15, -15, -6], // source v
    ["l", 0, 0, -15, 0], // substrate h
    ["l", -15, -3, -15, 3], // substrate v
    ["l", -6, -4, -1, 0], // arrow top
    ["l", -6, 4, -1, 0], // arrow bottom
    ["l", 0, 10, -15, 10], // drain h
    ["l", -15, 15, -15, 6], // drain v
  ],
  pins: [
    ["s", 0, -30],
    ["d", 0, 30],
    ["g", -30, 0],
  ],
  labels: [10, 0, "lm"],
  device: Mosfet,
};

const opamp: Symbol = {
  id: "opamp",
  name: "Operational amplifier",
  category: "Nonlinear",
  prefix: "OA",
  shapes: [
    ["l", -50, -30, -30, -30], // non-inverting leg
    ["l", -50, 30, -30, 30], // inverting leg
    ["l", 30, 0, 50, 0], // output leg
    ["l", -30, -50, 30, 0], // top line
    ["l", -30, 50, 30, 0], // bottom line
    ["l", -30, -50, -30, 50], // left line
    ["l", -25, -30, -15, -30], // plus h
    ["l", -20, -35, -20, -25], // plus v
    ["l", -25, 30, -15, 30], // minus h
  ],
  pins: [
    ["noninv", -50, -30],
    ["inv", -50, 30],
    ["out", 50, 0],
  ],
  labels: [-30, 55, "lt"],
  device: OpAmp,
};

export const nonlinear = {
  diode,
  zener,
  schottky,
  varicap,
  npn,
  pnp,
  nfet,
  pfet,
  nmos,
  pmos,
  opamp,
} as const satisfies Record<string, Symbol>;
