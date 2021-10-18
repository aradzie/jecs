import { dumpCircuit } from "@jssim/simulator/lib/circuit/debug";
import { JsonNetlist, readNetlist } from "@jssim/simulator/lib/netlist/netlist";
import { Controller, dcAnalysis } from "@jssim/simulator/lib/simulation/dc";

const netlists: readonly JsonNetlist[] = [
  [
    ["Ground", ["g"], {}],
    ["V", ["NP", "g"], { v: 5 }],
    ["Diode:DUT", ["g", "NP"], {}],
  ],
  [
    ["Ground", ["g"], {}],
    ["I", ["g", "NP"], { i: 0.1 }],
    ["Diode:DUT", ["NP", "g"], {}],
  ],
  [
    ["Ground", ["g"], {}],
    ["V", ["NP", "g"], { v: 1.6 }],
    ["Diode:DUT1", ["NP", "NM"], {}],
    ["Diode:DUT2", ["NM", "g"], {}],
  ],
  [
    ["Ground", ["g"], {}],
    ["V", ["NC", "g"], { v: 5 }],
    ["V", ["NB", "g"], { v: 0.65 }],
    ["BJT:DUT", ["g", "NB", "NC"], { polarity: "npn" }],
  ],
  [
    ["Ground", ["g"], {}],
    ["V", ["ND", "g"], { v: 15 }],
    ["V", ["NG", "g"], { v: 10 }],
    ["MOSFET:DUT", ["ND", "NG", "g"], { polarity: "nfet" }],
  ],
];

for (const netlist of netlists) {
  const circuit = readNetlist(netlist);
  const ctl = new Controller();
  dcAnalysis(circuit, {}, ctl);
  console.log(dumpCircuit(circuit));
  console.log(`Converged after ${ctl.iterationCount} iterations`);
}
