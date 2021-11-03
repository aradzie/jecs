import { parseNetlist } from "@jssim/simulator/lib/netlist/netlist";
import { parse } from "@jssim/simulator/lib/netlist/parser";
import { Variables } from "@jssim/simulator/lib/netlist/variables";
import { dcAnalysis } from "@jssim/simulator/lib/simulation/dc";
import { Dataset, points } from "./util/dataset";
import { op } from "./util/ops";

const input = `
V np g V=$xVd;
Diode:DUT np g @diode;
`;
const netlist = parse(input, {});

const dataset = new Dataset();

for (const xVd of points(0.5, 0.9, 100)) {
  const variables = new Variables();
  variables.setVariable("$xVd", xVd);
  const circuit = parseNetlist(netlist, variables);
  dcAnalysis(circuit);
  const ops = circuit.getDevice("DUT").ops();
  const V = op(ops, "V");
  const I = op(ops, "I");
  dataset.add(V, I);
}

dataset.save("iv-diode");
