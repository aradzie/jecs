import { dumpCircuit } from "@jssim/simulator/lib/circuit/debug";
import { parseNetlist } from "@jssim/simulator/lib/netlist/netlist";
import { Controller, dcAnalysis } from "@jssim/simulator/lib/simulation/dc";

const netlists: readonly string[] = [
  `
    Ground g;
    V np g v=5;
    Diode:DUT g np;
  `,
  `
    Ground g;
    I g np i=0.1;
    Diode:DUT np g;
  `,
  `
    Ground g;
    V np g v=1.6;
    Diode:DUT1 np nm;
    Diode:DUT2 nm g;
  `,
  `
    Ground g;
    V nc g v=5;
    V nb g v=0.65;
    BJT:DUT g nb nc polarity="npn";
  `,
  `
    Ground g;
    V nd g v=15;
    V ng g v=10;
    MOSFET:DUT nd ng g polarity="nfet";
  `,
];

for (const netlist of netlists) {
  const circuit = parseNetlist(netlist);
  const ctl = new Controller();
  dcAnalysis(circuit, {}, ctl);
  console.log(dumpCircuit(circuit));
  console.log(`Converged after ${ctl.iterationCount} iterations`);
}
