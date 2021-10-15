import { readNetlist } from "@jssim/simulator/lib/netlist/netlist";
import { dcAnalysis } from "@jssim/simulator/lib/simulation/dc";
import { Dataset, points } from "./dataset";
import { op } from "./ops";

const dataset = new Dataset();

for (const xVgs of points(3, 10, 5)) {
  for (const xVds of points(0, 10, 100)) {
    const circuit = readNetlist([
      ["Ground", ["g"], {}],
      ["V", ["ND", "g"], { v: xVds }],
      ["V", ["NG", "g"], { v: xVgs }],
      ["MOSFET:DUT", ["ND", "NG", "g"], { polarity: "nfet" }],
    ]);
    dcAnalysis(circuit);
    const ops = circuit.getDevice("DUT").ops();
    const Vds = op(ops, "Vds");
    const Ids = op(ops, "Ids");
    dataset.add(Vds, Ids);
  }
  dataset.break();
}

dataset.save("iv-mosfet");
