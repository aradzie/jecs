import { parseNetlist } from "@jssim/simulator/lib/netlist/netlist";
import { parse } from "@jssim/simulator/lib/netlist/parser";
import { Variables } from "@jssim/simulator/lib/netlist/variables";
import { dcAnalysis } from "@jssim/simulator/lib/simulation/dc";
import { Dataset, points } from "./util/dataset";
import { op } from "./util/ops";

const input = `
Ground g;
V nr g V=10;
V ng g V=$xVgs;
R nr nd R=$xRl;
MOSFET:Q1 nd ng g polarity="nfet";
`;
const netlist = parse(input, {});

const dataset = new Dataset();

for (const xRl of points(100, 2000, 10)) {
  for (const xVgs of points(2, 4, 100)) {
    const variables = new Variables();
    variables.setVariable("$xRl", xRl);
    variables.setVariable("$xVgs", xVgs);
    const circuit = parseNetlist(netlist, variables);
    dcAnalysis(circuit);
    const q1 = circuit.getDevice("Q1").ops();
    const nd = circuit.getNode("nd");
    dataset.add(op(q1, "Vgs"), nd.voltage);
  }
  dataset.break();
}

dataset.save("amp-mosfet");
