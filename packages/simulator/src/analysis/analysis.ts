import { EventEmitter } from "events";
import type { Circuit } from "../circuit/circuit.js";
import { ConstantExp } from "../circuit/equations.js";
import { Properties } from "../circuit/properties.js";
import { logger } from "../util/logging.js";
import {
  allCircuitProbes,
  Dataset,
  DatasetBuilder,
  makeDatasetBuilder,
  Probe,
  timeProbe,
} from "./dataset.js";
import { dcProperties, getOptions, tranProperties } from "./options.js";
import { Solver } from "./solver.js";
import { groupName, Sweep } from "./sweep.js";

export const analysisStarted = Symbol();
export const analysisEnded = Symbol();
export const analysisError = Symbol();

export abstract class Analysis extends EventEmitter {
  readonly sweeps: Sweep[] = [];

  constructor(readonly properties: Properties) {
    super();
  }

  run(circuit: Circuit): Dataset {
    logger.reset();
    this.emit(analysisStarted, this);
    const dataset = makeDatasetBuilder(this.getProbes(circuit));
    let err = null;
    try {
      this.runImpl(circuit, dataset);
    } catch (arg: any) {
      err = arg;
    }
    if (err != null) {
      this.emit(analysisError, this, err);
      throw err;
    } else {
      const result = dataset.build();
      this.emit(analysisEnded, this, result);
      return result;
    }
  }

  protected abstract getProbes(circuit: Circuit): Probe[];

  protected abstract runImpl(circuit: Circuit, dataset: DatasetBuilder): void;
}

export class DcAnalysis extends Analysis {
  constructor() {
    super(new Properties(dcProperties));
  }

  protected override getProbes(circuit: Circuit): Probe[] {
    return [...allCircuitProbes(circuit)];
  }

  protected override runImpl(circuit: Circuit, dataset: DatasetBuilder): void {
    const temp = this.properties.getNumber("temp");
    const options = getOptions(this.properties);
    const solver = new Solver(circuit, options);

    Sweep.walk(this.sweeps, {
      enter: (sweep, level, steps) => {
        dataset.group(groupName(steps));
      },
      set: ({ variableId }, value) => {
        circuit.equations.set(variableId, new ConstantExp(value));
      },
      end: () => {
        circuit.elapsedTime = 0;
        circuit.timeStep = NaN;
        circuit.temp = temp;
        circuit.reset();
        solver.solve();
        dataset.capture();
      },
      leave: (sweep, level, steps) => {},
    });
  }
}

export class TranAnalysis extends Analysis {
  constructor() {
    super(new Properties(tranProperties));
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
        if (dc === "yes") {
          circuit.elapsedTime = 0;
          circuit.timeStep = NaN;
          circuit.temp = temp;
          circuit.reset();
          solver.solve();
        } else {
          circuit.elapsedTime = 0;
          circuit.timeStep = 0;
          circuit.temp = temp;
          circuit.reset();
        }
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
