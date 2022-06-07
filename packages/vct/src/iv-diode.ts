import { parseNetlist } from "@jssim/simulator/lib/netlist/netlist.js";
import { parse } from "@jssim/simulator/lib/netlist/parser.js";
import { Variables } from "@jssim/simulator/lib/netlist/variables.js";
import { opAnalysis } from "@jssim/simulator/lib/simulation/op.js";
import { Dataset, points } from "./util/dataset.js";

const input = `
V np g V=$xVd;
Diode:DUT np g @D;
`;
const netlist = parse(input, {});

const dataset = new Dataset();

for (const xVd of points(0.5, 0.9, 100)) {
  const variables = new Variables();
  variables.setVariable("$xVd", xVd);
  const circuit = parseNetlist(netlist, variables);
  opAnalysis(circuit);
  const dut = circuit.getDevice("DUT");
  const V = dut.op("V");
  const I = dut.op("I");
  dataset.add(V, I);
}

dataset.save("iv-diode");
