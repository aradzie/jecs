import { parseNetlist } from "@jssim/simulator/lib/netlist/netlist";
import { parse } from "@jssim/simulator/lib/netlist/parser";
import { Variables } from "@jssim/simulator/lib/netlist/variables";
import { dcAnalysis } from "@jssim/simulator/lib/simulation/dc";
import { formatNumber } from "@jssim/simulator/lib/util/format";
import { Unit } from "@jssim/simulator/lib/util/unit";
import { Dataset, points } from "./util/dataset";
import { op } from "./util/ops";

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
    const ops = circuit.getDevice("DUT").ops();
    const Vds = op(ops, "Vds");
    const Ids = op(ops, "Ids");
    dataset.add(Vds, Ids);
  }
}

dataset.save("iv-jfet");
