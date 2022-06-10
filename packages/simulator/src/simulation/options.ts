import { Properties, Temp } from "../circuit/properties.js";

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
const maxIter = Properties.number({
  default: 150,
  min: 1,
  title: "maximum number of iterations",
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

export const dcProperties = {
  temp,
  abstol,
  vntol,
  reltol,
  maxIter,
  gmin,
};

export const tranProperties = {
  timeInterval,
  timeStep,
  temp,
  abstol,
  vntol,
  reltol,
  maxIter,
  gmin,
  integrationMethod,
};

export interface ConvergenceOptions {
  /** Absolute current error tolerance, `A`. */
  readonly abstol: number;
  /** Absolute voltage error tolerance, `V`. */
  readonly vntol: number;
  /** Relative error tolerance. */
  readonly reltol: number;
  /** Maximum number of non-linear iterations. */
  readonly maxIter: number;
}

export interface SimulationOptions extends ConvergenceOptions {
  //
}

export function getOptions(properties: Properties): SimulationOptions {
  return {
    abstol: properties.getNumber("abstol"),
    vntol: properties.getNumber("vntol"),
    reltol: properties.getNumber("reltol"),
    maxIter: properties.getNumber("maxIter"),
  };
}
