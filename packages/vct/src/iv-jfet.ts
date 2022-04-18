import { parseNetlist } from "@jssim/simulator/lib/netlist/netlist.js";
import { parse } from "@jssim/simulator/lib/netlist/parser.js";
import { Variables } from "@jssim/simulator/lib/netlist/variables.js";
import { dcAnalysis } from "@jssim/simulator/lib/simulation/dc.js";
import { formatNumber } from "@jssim/simulator/lib/util/format.js";
import { Unit } from "@jssim/simulator/lib/util/unit.js";
import { Dataset, points } from "./util/dataset.js";

const input = `
V nd g V=$xVds;
V ng g V=$xVgs;
JFET:DUT g ng nd @nfet beta=0.001;
`;
const netlist = parse(input, {});

const dataset = new Dataset();

for (const xVgs of points(-1.5, 0, 5)) {
  dataset.group(`Vgs=${formatNumber(xVgs, Unit.VOLT)}`);
  for (const xVds of points(0, 3, 100)) {
    const variables = new Variables();
    variables.setVariable("$xVds", xVds);
    variables.setVariable("$xVgs", xVgs);
    const circuit = parseNetlist(netlist, variables);
    dcAnalysis(circuit);
    const dut = circuit.getDevice("DUT");
    const Vds = dut.op("Vds");
    const Ids = dut.op("Ids");
    dataset.add(Vds, Ids);
  }
}

dataset.save("iv-jfet");
