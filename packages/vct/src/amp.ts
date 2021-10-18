import { parseNetlist } from "@jssim/simulator/lib/netlist/netlist";
import { Variables } from "@jssim/simulator/lib/netlist/variables";
import { dcAnalysis } from "@jssim/simulator/lib/simulation/dc";
import { Dataset, points } from "./util/dataset";
import { op } from "./util/ops";

const input = `
Ground [g];
V [NR g] v=10;
V [NB g] v=$xVbe;
R:R1 [NR NC] r=$xRl;
BJT:Q1 [g NB NC] polarity="npn" Bf=100;
`;

const dataset = new Dataset();

for (const xRl of points(100, 2000, 10)) {
  for (const xVbe of points(0.5, 0.8, 100)) {
    const variables = new Variables();
    variables.addVariable("$xRl", xRl);
    variables.addVariable("$xVbe", xVbe);
    const circuit = parseNetlist(input, variables);
    dcAnalysis(circuit);
    const q1 = circuit.getDevice("Q1").ops();
    const nc = circuit.getNode("NC");
    dataset.add(op(q1, "Vbe"), nc.voltage);
  }
  dataset.break();
}

dataset.save("amp");
