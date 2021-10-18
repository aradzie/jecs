import { parseNetlist } from "@jssim/simulator/lib/netlist/netlist";
import { Variables } from "@jssim/simulator/lib/netlist/variables";
import { dcAnalysis } from "@jssim/simulator/lib/simulation/dc";
import { Dataset, points } from "./util/dataset";
import { op } from "./util/ops";

const input = `
Ground [g];
V [NC g] v=$xVce;
V [NB g] v=$xVbe;
BJT:DUT [g NB NC] polarity="npn";
`;

const dataset = new Dataset();

for (const xVbe of points(0.6, 0.65, 5)) {
  for (const xVce of points(0, 1, 100)) {
    const variables = new Variables();
    variables.addVariable("$xVce", xVce);
    variables.addVariable("$xVbe", xVbe);
    const circuit = parseNetlist(input, variables);
    dcAnalysis(circuit);
    const ops = circuit.getDevice("DUT").ops();
    const Vce = op(ops, "Vce");
    const Ic = op(ops, "Ic");
    dataset.add(Vce, Ic);
  }
  dataset.break();
}

dataset.save("iv-bjt");
