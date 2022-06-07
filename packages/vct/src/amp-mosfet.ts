import { parseNetlist } from "@jssim/simulator/lib/netlist/netlist.js";
import { parse } from "@jssim/simulator/lib/netlist/parser.js";
import { Variables } from "@jssim/simulator/lib/netlist/variables.js";
import { opAnalysis } from "@jssim/simulator/lib/simulation/op.js";
import { formatNumber } from "@jssim/simulator/lib/util/format.js";
import { Unit } from "@jssim/simulator/lib/util/unit.js";
import { Dataset, points } from "./util/dataset.js";

const input = `
Ground g;
V nr g V=10;
V ng g V=$xVgs;
R nr nd R=$xRl;
MOSFET:Q1 g ng nd g @NMOS;
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
    opAnalysis(circuit);
    const q1 = circuit.getDevice("Q1");
    const nd = circuit.getNode("nd");
    dataset.add(q1.op("Vgs"), nd.voltage);
  }
}

dataset.save("amp-mosfet");
