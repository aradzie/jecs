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
    const gmin = this.properties.getNumber("gmin");
    const options = getOptions(this.properties);
    const table = makeTableBuilder(circuit, false);
    const simulator = newSimulator(circuit, options);

    Sweep.walk(this.sweeps, {
      enter: (sweep, level, steps) => {
        const a = steps.map(
          ({ sweep: { instanceId, propertyId }, value }) => `${instanceId}:${propertyId}=${value}`,
        );
        table.group(`"${a.join(", ")}"`);
      },
      set: ({ instanceId, propertyId }, value) => {
        const device = circuit.getDevice(instanceId);
        device.properties.set(propertyId, value);
        device.deriveState(device.state);
      },
      end: () => {
        circuit.reset();
        simulator({
          elapsedTime: 0,
          timeStep: NaN,
          gmin,
        });
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
    const startTime = this.properties.getNumber("startTime");
    const stopTime = this.properties.getNumber("stopTime");
    const timeStep = this.properties.getNumber("timeStep");
    const gmin = this.properties.getNumber("gmin");
    const options = getOptions(this.properties);
    const table = makeTableBuilder(circuit, true);
    const simulator = newSimulator(circuit, options);

    circuit.reset();
    let step = 0;
    let elapsedTime = 0;
    while (elapsedTime <= stopTime) {
      simulator({
        elapsedTime,
        timeStep,
        gmin,
      });
      step += 1;
      elapsedTime = timeStep * step;
      if (elapsedTime >= startTime) {
        table.capture(elapsedTime);
      }
    }

    return table.build();
  }
}
