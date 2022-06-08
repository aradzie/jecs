import type { Circuit } from "../circuit/circuit.js";
import { Properties, Temp } from "../circuit/properties.js";
import { getOptions } from "./options.js";
import { makeOutputBuilder, Output } from "./output.js";
import { newSimulator } from "./simulator.js";

const timeInterval = Properties.number({
  min: 0,
  title: "simulation time interval",
});
const timeStep = Properties.number({
  min: 0,
  title: "simulation time step",
});
const temp = Properties.number({
  default: Temp,
  min: -273.15, // Absolute zero.
  title: "simulation temperature in degrees Celsius",
});
const abstol = Properties.number({
  default: 1e-12, // 1pA
  min: 0,
  title: "absolute current error tolerance in amperes",
});
const vntol = Properties.number({
  default: 1e-6, // 1uV
  min: 0,
  title: "absolute voltage error tolerance in volts",
});
const reltol = Properties.number({
  default: 1e-3,
  min: 0,
  title: "relative error tolerance",
});
const gmin = Properties.number({
  default: 1e-12,
  min: 0,
  title: "minimum conductance in siemens",
});
const integrationMethod = Properties.enum({
  values: ["trapezoidal", "euler"],
  title: "integration method",
});

const dcProperties = {
  Temp: temp,
  abstol,
  vntol,
  reltol,
  gmin,
};

const tranProperties = {
  timeInterval,
  timeStep,
  Temp: temp,
  abstol,
  vntol,
  reltol,
  gmin,
  integrationMethod,
};

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
