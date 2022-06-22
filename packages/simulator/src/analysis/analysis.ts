import type { Circuit } from "../circuit/circuit.js";
import { Properties } from "../circuit/properties.js";
import { logger } from "../util/logging.js";
import { makeTableBuilder, Table } from "./dataset.js";
import { dcProperties, getOptions, tranProperties } from "./options.js";
import { Solver } from "./solver.js";
import { groupName, Sweep } from "./sweep.js";

export abstract class Analysis {
  readonly sweeps: Sweep[] = [];

  constructor(readonly properties: Properties) {}

  abstract run(circuit: Circuit): Table;
}

export class DcAnalysis extends Analysis {
  constructor() {
    super(new Properties(dcProperties));
  }

  override run(circuit: Circuit): Table {
    logger.reset();

    const temp = this.properties.getNumber("temp");
    const options = getOptions(this.properties);
    const table = makeTableBuilder(circuit, false);
    const solver = new Solver(circuit, options);

    Sweep.walk(this.sweeps, {
      enter: (sweep, level, steps) => {
        table.group(groupName(steps));
      },
      set: ({ instanceId, propertyId }, value) => {
        circuit.getDevice(instanceId).properties.set(propertyId, value);
      },
      end: () => {
        circuit.elapsedTime = 0;
        circuit.timeStep = NaN;
        circuit.temp = temp;
        circuit.reset();
        solver.reset();
        solver.solve();
        table.capture(NaN);
      },
      leave: (sweep, level, steps) => {},
    });

    return table.build();
  }
}

export class TranAnalysis extends Analysis {
  constructor() {
    super(new Properties(tranProperties));
  }

  override run(circuit: Circuit): Table {
    logger.reset();

    const startTime = this.properties.getNumber("startTime");
    const stopTime = this.properties.getNumber("stopTime");
    const timeStep = this.properties.getNumber("timeStep");
    const temp = this.properties.getNumber("temp");
    const options = getOptions(this.properties);
    const table = makeTableBuilder(circuit, true);
    const solver = new Solver(circuit, options);

    Sweep.walk(this.sweeps, {
      enter: (sweep, level, steps) => {},
      set: ({ instanceId, propertyId }, value) => {
        circuit.getDevice(instanceId).properties.set(propertyId, value);
      },
      end: (steps) => {
        if (steps.length > 0) {
          table.group(groupName(steps));
        }
        circuit.elapsedTime = 0;
        circuit.timeStep = 0;
        circuit.temp = temp;
        circuit.reset();
        solver.reset();
        let step = 0;
        let elapsedTime = 0;
        while (elapsedTime <= stopTime) {
          circuit.elapsedTime = elapsedTime;
          circuit.timeStep = timeStep;
          circuit.temp = temp;
          solver.solve();
          if (elapsedTime >= startTime) {
            table.capture(elapsedTime);
          }
          step += 1;
          elapsedTime = timeStep * step;
        }
      },
      leave: (sweep, level, steps) => {},
    });

    return table.build();
  }
}
