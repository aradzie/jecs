import { parseNetlist } from "@jssim/simulator/lib/netlist/netlist.js";
import { parse } from "@jssim/simulator/lib/netlist/parser.js";
import { Variables } from "@jssim/simulator/lib/netlist/variables.js";
import { opAnalysis } from "@jssim/simulator/lib/simulation/op.js";
import { formatNumber } from "@jssim/simulator/lib/util/format.js";
import { Unit } from "@jssim/simulator/lib/util/unit.js";
import { Dataset, points } from "./util/dataset.js";

const input = `
V nd g V=$xVds;
V ng g V=$xVgs;
MOSFET:DUT g ng nd g @NMOS;
`;
const netlist = parse(input, {});

const dataset = new Dataset();

for (const xVgs of points(3, 10, 5)) {
  dataset.group(`Vgs=${formatNumber(xVgs, Unit.VOLT)}`);
  for (const xVds of points(0, 10, 100)) {
    const variables = new Variables();
    variables.setVariable("$xVds", xVds);
    variables.setVariable("$xVgs", xVgs);
    const circuit = parseNetlist(netlist, variables);
    opAnalysis(circuit);
    const dut = circuit.getDevice("DUT");
    const Vds = dut.op("Vds");
    const Ids = dut.op("Ids");
    dataset.add(Vds, Ids);
  }
}

dataset.save("iv-mosfet");
