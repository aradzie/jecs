import type { Circuit } from "../circuit/circuit.js";
import { ConstantExp } from "../circuit/equations.js";
import { allCircuitProbes, Probe, timeProbe } from "../circuit/probe.js";
import { Properties } from "../circuit/properties.js";
import { Analysis } from "./analysis.js";
import type { DatasetBuilder } from "./dataset.js";
import { getOptions, trProperties } from "./options.js";
import { Solver } from "./solver.js";
import { groupName, Sweep } from "./sweep.js";

export class TrAnalysis extends Analysis {
  constructor() {
    super(new Properties(trProperties));
  }

  protected override getProbes(circuit: Circuit): Probe[] {
    return [timeProbe(circuit), ...allCircuitProbes(circuit)];
  }

  protected override runImpl(circuit: Circuit, dataset: DatasetBuilder): void {
    const startTime = this.properties.getNumber("startTime");
    const stopTime = this.properties.getNumber("stopTime");
    const timeStep = this.properties.getNumber("timeStep");
    const dc = this.properties.getString("dc");
    const temp = this.properties.getNumber("temp");
    const options = getOptions(this.properties);
    const solver = new Solver(circuit, options);

    Sweep.walk(this.sweeps, {
      enter: (sweep, level, steps) => {},
      set: ({ variableId }, value) => {
        circuit.equations.set(variableId, new ConstantExp(value));
      },
      end: (steps) => {
        if (steps.length > 0) {
          dataset.group(groupName(steps));
        }
        circuit.elapsedTime = NaN;
        circuit.timeStep = NaN;
        circuit.temp = temp;
        circuit.reset();
        if (dc === "yes") {
          solver.useDc();
          solver.solve();
        }
        solver.useTr();
        let step = 0;
        let elapsedTime = 0;
        while (elapsedTime <= stopTime) {
          circuit.elapsedTime = elapsedTime;
          circuit.timeStep = timeStep;
          circuit.temp = temp;
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
