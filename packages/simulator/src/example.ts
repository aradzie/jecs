import { dumpCircuit } from "./circuit/debug";
import { readNetlist } from "./netlist/netlist";
import { Controller, dcAnalysis } from "./simulation/dc";

{
  const circuit = readNetlist([
    ["Ground", ["g"], {}],
    ["V", ["NP", "g"], { v: 5 }],
    ["Diode:DUT", ["g", "NP"], {}],
  ]);
  const ctl = new Controller();
  dcAnalysis(circuit, {}, ctl);
  console.log(dumpCircuit(circuit));
  console.log(`Converged after ${ctl.iterationCount} iterations`);
}

{
  const circuit = readNetlist([
    ["Ground", ["g"], {}],
    ["I", ["g", "NP"], { i: 0.1 }],
    ["Diode:DUT", ["NP", "g"], {}],
  ]);
  const ctl = new Controller();
  dcAnalysis(circuit, {}, ctl);
  console.log(dumpCircuit(circuit));
  console.log(`Converged after ${ctl.iterationCount} iterations`);
}

{
  const circuit = readNetlist([
    ["Ground", ["g"], {}],
    ["V", ["NP", "g"], { v: 1.6 }],
    ["Diode:DUT1", ["NP", "NM"], {}],
    ["Diode:DUT2", ["NM", "g"], {}],
  ]);
  const ctl = new Controller();
  dcAnalysis(circuit, {}, ctl);
  console.log(dumpCircuit(circuit));
  console.log(`Converged after ${ctl.iterationCount} iterations`);
}
