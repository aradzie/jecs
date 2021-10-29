import { parseNetlist } from "@jssim/simulator/lib/netlist/netlist";
import { parse } from "@jssim/simulator/lib/netlist/parser";
import { Variables } from "@jssim/simulator/lib/netlist/variables";
import { dcAnalysis } from "@jssim/simulator/lib/simulation/dc";
import { formatNumber } from "@jssim/simulator/lib/util/format";
import { Unit } from "@jssim/simulator/lib/util/unit";
import { Dataset, points } from "./util/dataset";
import { op } from "./util/ops";

const input = `
Ground g;
V nr g V=10;
V nb g V=$xVbe;
R nr nc R=$xRl;
BJT:Q1 g nb nc @npn;
`;
const netlist = parse(input, {});

const dataset = new Dataset();

for (const xRl of points(100, 2000, 5)) {
  dataset.group(`Rl=${formatNumber(xRl, Unit.OHM)}`);
  for (const xVbe of points(0.5, 0.8, 100)) {
    const variables = new Variables();
    variables.setVariable("$xRl", xRl);
    variables.setVariable("$xVbe", xVbe);
    const circuit = parseNetlist(netlist, variables);
    dcAnalysis(circuit);
    const q1 = circuit.getDevice("Q1").ops();
    const nc = circuit.getNode("nc");
    dataset.add(op(q1, "Vbe"), nc.voltage);
  }
}

dataset.save("amp-bjt");
