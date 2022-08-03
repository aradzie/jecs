import { Circuit } from "../circuit/circuit.js";
import { ConstantExp } from "../circuit/equations.js";
import type { Probe } from "../circuit/probe.js";
import { allNodeProbes, frequencyProbe } from "../circuit/probe.js";
import { Properties, PropertiesSchema } from "../circuit/properties.js";
import { Analysis } from "./analysis.js";
import type { DatasetBuilder } from "./dataset.js";
import { AcSolver } from "./solver-ac.js";
import { groupName, Sweep } from "./sweep.js";

export class AcAnalysis extends Analysis {
  static readonly propertiesSchema: PropertiesSchema = {
    ...Circuit.propertiesSchema,
    type: Properties.string({
      range: ["lin", "log"],
      title: "frequency sweep type",
    }),
    start: Properties.number({
      range: ["real", ">", 0],
      title: "start frequency",
    }),
    stop: Properties.number({
      range: ["real", ">", 0],
      title: "stop frequency",
    }),
    points: Properties.number({
      range: ["integer", ">", 1],
      title: "number of frequency points",
    }),
  };

  constructor() {
    super(AcAnalysis.propertiesSchema);
  }

  protected getProbes(circuit: Circuit): Probe[] {
    return [frequencyProbe(circuit), ...allNodeProbes(circuit, true)];
  }

  protected runImpl(circuit: Circuit, dataset: DatasetBuilder): void {
    const { properties } = this;
    const temp = properties.getNumber("temp");
    const sweep = Sweep.from("frequency", properties);
    const solver = new AcSolver(circuit);

    Sweep.walk(this.sweeps, {
      enter: (sweep, level, steps) => {},
      set: ({ id }, value) => {
        circuit.equations.set(id, new ConstantExp(value));
      },
      end: (steps) => {
        if (steps.length > 0) {
          dataset.group(groupName(steps));
        }

        for (const frequency of sweep) {
          circuit.temp = temp;
          circuit.time = NaN;
          circuit.frequency = frequency;
          circuit.reset();
          solver.solve();
          dataset.capture();
        }
      },
      leave: (sweep, level, steps) => {},
    });
  }
}
