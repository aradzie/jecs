import { dumpCircuit } from "./circuit/debug";
import { readNetlist } from "./netlist/netlist";
import { Controller, dcAnalysis } from "./simulation/dc";

{
  const circuit = readNetlist([
    ["g", ["g"], {}],
    ["v", ["NP", "g"], { v: 5 }],
    ["d:DUT", ["g", "NP"], {}],
  ]);
  const ctl = new Controller();
  dcAnalysis(circuit, {}, ctl);
  console.log(dumpCircuit(circuit));
  console.log(`Converged after ${ctl.iterationCount} iterations`);
}

{
  const circuit = readNetlist([
    ["g", ["g"], {}],
    ["i", ["g", "NP"], { i: 0.1 }],
    ["d:DUT", ["NP", "g"], {}],
  ]);
  const ctl = new Controller();
  dcAnalysis(circuit, {}, ctl);
  console.log(dumpCircuit(circuit));
  console.log(`Converged after ${ctl.iterationCount} iterations`);
}

{
  const circuit = readNetlist([
    ["g", ["g"], {}],
    ["v", ["NP", "g"], { v: 1.6 }],
    ["d:DUT1", ["NP", "NM"], {}],
    ["d:DUT2", ["NM", "g"], {}],
  ]);
  const ctl = new Controller();
  dcAnalysis(circuit, {}, ctl);
  console.log(dumpCircuit(circuit));
  console.log(`Converged after ${ctl.iterationCount} iterations`);
}
