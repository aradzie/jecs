import type { Circuit } from "../circuit/circuit.js";
import { Properties } from "../circuit/properties.js";
import { dcProperties, getOptions, tranProperties } from "./options.js";
import { makeOutputBuilder, Output } from "./output.js";
import { newSimulator } from "./simulator.js";

export abstract class Analysis {
  constructor(readonly properties: Properties) {}

  abstract run(circuit: Circuit): Output;
}

export class DcAnalysis extends Analysis {
  constructor() {
    super(new Properties(dcProperties));
  }

  override run(circuit: Circuit): Output {
    const { properties } = this;
    circuit.reset();
    const gmin = properties.getNumber("gmin");
    const options = getOptions(this.properties);
    const output = makeOutputBuilder(circuit);
    const simulator = newSimulator(circuit, options);
    simulator({
      elapsedTime: 0,
      timeStep: NaN,
      gmin,
    });
    output.append(0);
    return output.build();
  }
}

export class TranAnalysis extends Analysis {
  constructor() {
    super(new Properties(tranProperties));
  }

  override run(circuit: Circuit): Output {
    const { properties } = this;
    circuit.reset();
    const timeInterval = properties.getNumber("timeInterval");
    const timeStep = properties.getNumber("timeStep");
    const gmin = properties.getNumber("gmin");
    const options = getOptions(properties);
    const builder = makeOutputBuilder(circuit);
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
      builder.append(elapsedTime);
    }
    return builder.build();
  }
}
