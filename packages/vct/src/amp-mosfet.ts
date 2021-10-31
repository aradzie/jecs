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
V ng g V=$xVgs;
R nr nd R=$xRl;
MOSFET:Q1 g ng nd g @nmos;
`;
const netlist = parse(input, {});

const dataset = new Dataset();

for (const xRl of points(2000, 100, 5)) {
  dataset.group(`Rl=${formatNumber(xRl, Unit.OHM)}`);
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
}

dataset.save("amp-mosfet");
