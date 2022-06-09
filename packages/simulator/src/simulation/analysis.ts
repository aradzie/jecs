import type { Circuit } from "../circuit/circuit.js";
import { Properties } from "../circuit/properties.js";
import { makeTableBuilder, Table } from "./dataset.js";
import { dcProperties, getOptions, tranProperties } from "./options.js";
import { newSimulator } from "./simulator.js";
import { Sweep } from "./sweep.js";

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
    const { properties } = this;
    const gmin = properties.getNumber("gmin");
    const options = getOptions(this.properties);
    const table = makeTableBuilder(circuit);

    Sweep.walk(this.sweeps, {
      enter: (sweep, level) => {
        table.group(null);
      },
      set: ({ instanceId, propertyId }, value) => {
        const device = circuit.getDevice(instanceId);
        device.properties.set(propertyId, value);
        device.deriveState(device.state);
      },
      end: () => {
        circuit.reset();
        const simulator = newSimulator(circuit, options);
        simulator({
          elapsedTime: 0,
          timeStep: NaN,
          gmin,
        });
        table.capture(0);
      },
      leave: (sweep, level) => {},
    });

    return table.build();
  }
}

export class TranAnalysis extends Analysis {
  constructor() {
    super(new Properties(tranProperties));
  }

  override run(circuit: Circuit): Table {
    const { properties } = this;
    const timeInterval = properties.getNumber("timeInterval");
    const timeStep = properties.getNumber("timeStep");
    const gmin = properties.getNumber("gmin");
    const options = getOptions(properties);
    const table = makeTableBuilder(circuit);

    Sweep.walk(this.sweeps, {
      enter: (sweep, level) => {
        table.group(null);
      },
      set: ({ instanceId, propertyId }, value) => {
        const device = circuit.getDevice(instanceId);
        device.properties.set(propertyId, value);
        device.deriveState(device.state);
      },
      end: () => {
        circuit.reset();
        let step = 0;
        let elapsedTime = 0;
        const simulator = newSimulator(circuit, options);
        while (elapsedTime <= timeInterval) {
          simulator({
            elapsedTime,
            timeStep,
            gmin,
          });
          step += 1;
          elapsedTime = timeStep * step;
          table.capture(elapsedTime);
        }
      },
      leave: (sweep, level) => {},
    });

    return table.build();
  }
}
