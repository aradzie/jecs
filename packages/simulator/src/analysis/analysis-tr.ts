import { Circuit } from "../circuit/circuit.js";
import { ConstantExp } from "../circuit/equations.js";
import { allDeviceProbes, allNodeProbes, Probe, timeProbe } from "../circuit/probe.js";
import { Properties, PropertiesSchema } from "../circuit/properties.js";
import { Analysis } from "./analysis.js";
import type { DatasetBuilder } from "./dataset.js";
import { NonlinearSolver } from "./solver-nonlinear.js";
import { groupName, Sweep } from "./sweep.js";

export class TrAnalysis extends Analysis {
  static readonly propertiesSchema: PropertiesSchema = {
    startTime: Properties.number({
      defaultValue: 0,
      range: ["real", ">=", 0],
      title: "simulation start time",
    }),
    stopTime: Properties.number({
      range: ["real", ">", 0],
      title: "simulation stop time",
    }),
    timeStep: Properties.number({
      range: ["real", ">", 0],
      title: "simulation time step",
    }),
    integrationMethod: Properties.string({
      defaultValue: "trapezoidal",
      range: ["trapezoidal", "euler"],
      title: "integration method",
    }),
    dc: Properties.string({
      defaultValue: "yes",
      range: ["yes", "no"],
      title: "start with DC analysis",
    }),
    ...Circuit.propertiesSchema,
    ...NonlinearSolver.propertiesSchema,
  };

  constructor() {
    super(TrAnalysis.propertiesSchema);
  }

  protected override getProbes(circuit: Circuit): Probe[] {
    return [timeProbe(circuit), ...allNodeProbes(circuit), ...allDeviceProbes(circuit)];
  }

  protected override runImpl(circuit: Circuit, dataset: DatasetBuilder): void {
    const { properties } = this;
    const startTime = properties.getNumber("startTime");
    const stopTime = properties.getNumber("stopTime");
    const timeStep = properties.getNumber("timeStep");
    const dc = properties.getString("dc");
    const temp = properties.getNumber("temp");
    const solver = new NonlinearSolver(circuit, properties);

    Sweep.walk(this.sweeps, {
      enter: (sweep, level, steps) => {},
      set: ({ id }, value) => {
        circuit.equations.set(id, new ConstantExp(value));
      },
      end: (steps) => {
        if (steps.length > 0) {
          dataset.group(groupName(steps));
        }
        circuit.temp = temp;
        circuit.elapsedTime = NaN;
        circuit.timeStep = NaN;
        circuit.reset();
        if (dc === "yes") {
          solver.useDc();
          solver.solve();
        }
        solver.useTr();
        let step = 0;
        let elapsedTime = 0;
        while (elapsedTime <= stopTime) {
          circuit.temp = temp;
          circuit.elapsedTime = elapsedTime;
          circuit.timeStep = timeStep;
          solver.solve();
          if (elapsedTime >= startTime) {
            dataset.capture();
          }
          step += 1;
          elapsedTime = timeStep * step;
        }
      },
      leave: (sweep, level, steps) => {},
    });
  }
}
