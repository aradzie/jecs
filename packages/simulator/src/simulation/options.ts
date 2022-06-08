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
  Temp: temp,
  abstol,
  vntol,
  reltol,
  gmin,
};

export const tranProperties = {
  timeInterval,
  timeStep,
  Temp: temp,
  abstol,
  vntol,
  reltol,
  gmin,
  integrationMethod,
};

export interface SimulationOptions {
  /** Absolute current error tolerance, `A`. */
  readonly abstol: number;
  /** Absolute voltage error tolerance, `V`. */
  readonly vntol: number;
  /** Relative error tolerance. */
  readonly reltol: number;
}

export function getOptions(properties: Properties): SimulationOptions {
  return {
    abstol: properties.getNumber("abstol"),
    vntol: properties.getNumber("vntol"),
    reltol: properties.getNumber("reltol"),
  };
}
