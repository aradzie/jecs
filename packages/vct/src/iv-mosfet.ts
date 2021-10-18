import { parseNetlist } from "@jssim/simulator/lib/netlist/netlist";
import { Variables } from "@jssim/simulator/lib/netlist/variables";
import { dcAnalysis } from "@jssim/simulator/lib/simulation/dc";
import { Dataset, points } from "./util/dataset";
import { op } from "./util/ops";

const input = `
Ground [g];
V [ND g] v=$xVds;
V [NG g] v=$xVgs;
MOSFET:DUT [ND NG g] polarity="nfet";
`;

const dataset = new Dataset();

for (const xVgs of points(3, 10, 5)) {
  for (const xVds of points(0, 10, 100)) {
    const variables = new Variables();
    variables.setVariable("$xVds", xVds);
    variables.setVariable("$xVgs", xVgs);
    const circuit = parseNetlist(input, variables);
    dcAnalysis(circuit);
    const ops = circuit.getDevice("DUT").ops();
    const Vds = op(ops, "Vds");
    const Ids = op(ops, "Ids");
    dataset.add(Vds, Ids);
  }
  dataset.break();
}

dataset.save("iv-mosfet");
