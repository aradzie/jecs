import { Properties } from "../circuit/properties.js";

const startTime = Properties.number({
  defaultValue: 0,
  range: ["real", ">=", 0],
  title: "simulation start time",
});
const stopTime = Properties.number({
  range: ["real", ">", 0],
  title: "simulation stop time",
});
const timeStep = Properties.number({
  range: ["real", ">", 0],
  title: "simulation time step",
});
const temp = Properties.number({
  defaultValue: 26.85, // Room temperature.
  range: ["real", ">", -273.15], // Absolute zero.
  title: "default device temperature in degrees Celsius",
});
const abstol = Properties.number({
  defaultValue: 1e-12, // 1pA
  range: ["real", ">", 0],
  title: "absolute current error tolerance in amperes",
});
const vntol = Properties.number({
  defaultValue: 1e-6, // 1uV
  range: ["real", ">", 0],
  title: "absolute voltage error tolerance in volts",
});
const reltol = Properties.number({
  defaultValue: 1e-3,
  range: ["real", ">", 0],
  title: "relative error tolerance",
});
const maxIter = Properties.number({
  defaultValue: 150,
  range: ["integer", ">", 1],
  title: "maximum number of iterations",
});
const integrationMethod = Properties.string({
  defaultValue: "trapezoidal",
  range: ["trapezoidal", "euler"],
  title: "integration method",
});

export const dcProperties = {
  temp,
  abstol,
  vntol,
  reltol,
  maxIter,
};

export const tranProperties = {
  startTime,
  stopTime,
  timeStep,
  temp,
  abstol,
  vntol,
  reltol,
  maxIter,
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
