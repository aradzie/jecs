import { Circuit } from "../circuit/circuit.js";
import { ConstantExp } from "../circuit/equations.js";
import { allDeviceProbes, allNodeProbes, Probe } from "../circuit/probe.js";
import type { PropertiesSchema } from "../circuit/properties.js";
import { Analysis } from "./analysis.js";
import type { DatasetBuilder } from "./dataset.js";
import { NonlinearSolver } from "./solver-nonlinear.js";
import { groupName, Sweep } from "./sweep.js";

export class DcAnalysis extends Analysis {
  static readonly propertiesSchema: PropertiesSchema = {
    ...Circuit.propertiesSchema,
    ...NonlinearSolver.propertiesSchema,
  };

  constructor() {
    super(DcAnalysis.propertiesSchema);
  }

  protected override getProbes(circuit: Circuit): Probe[] {
    return [...allNodeProbes(circuit), ...allDeviceProbes(circuit)];
  }

  protected override runImpl(circuit: Circuit, dataset: DatasetBuilder): void {
    const { properties } = this;
    const temp = properties.getNumber("temp");
    const solver = new NonlinearSolver(circuit, properties);

    Sweep.walk(this.sweeps, {
      enter: (sweep, level, steps) => {
        dataset.group(groupName(steps));
      },
      set: ({ id }, value) => {
        circuit.equations.set(id, new ConstantExp(value));
      },
      end: () => {
        circuit.temp = temp;
        circuit.elapsedTime = NaN;
        circuit.timeStep = NaN;
        circuit.reset();
        solver.useDc();
        solver.solve();
        dataset.capture();
      },
      leave: (sweep, level, steps) => {},
    });
  }
}
