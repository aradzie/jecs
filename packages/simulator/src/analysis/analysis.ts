import type { Circuit } from "../circuit/circuit.js";
import type { EvalParams } from "../circuit/device.js";
import { Properties } from "../circuit/properties.js";
import { logger } from "../util/logging.js";
import { makeTableBuilder, Table } from "./dataset.js";
import { dcProperties, getOptions, tranProperties } from "./options.js";
import { newSimulator } from "./simulator.js";
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
    const simulator = newSimulator(circuit, options);

    Sweep.walk(this.sweeps, {
      enter: (sweep, level, steps) => {
        table.group(groupName(steps));
      },
      set: ({ instanceId, propertyId }, value) => {
        circuit.getDevice(instanceId).properties.set(propertyId, value);
      },
      end: () => {
        const params: EvalParams = {
          elapsedTime: 0,
          timeStep: NaN,
          temp,
        };
        circuit.reset(params);
        simulator(params);
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
    const simulator = newSimulator(circuit, options);

    Sweep.walk(this.sweeps, {
      enter: (sweep, level, steps) => {},
      set: ({ instanceId, propertyId }, value) => {
        circuit.getDevice(instanceId).properties.set(propertyId, value);
      },
      end: (steps) => {
        if (steps.length > 0) {
          table.group(groupName(steps));
        }
        circuit.reset({
          elapsedTime: 0,
          timeStep: 0,
          temp,
        });
        let step = 0;
        let elapsedTime = 0;
        while (elapsedTime <= stopTime) {
          simulator({
            elapsedTime,
            timeStep,
            temp,
          });
          step += 1;
          elapsedTime = timeStep * step;
          if (elapsedTime >= startTime) {
            table.capture(elapsedTime);
          }
        }
      },
      leave: (sweep, level, steps) => {},
    });

    return table.build();
  }
}
