import { celsiusToKelvin } from "../util/unit.js";

/** Nominal temperature. */
export const Tnom = celsiusToKelvin(26.85);

/** The electrical charge on the electron, `C`. */
export const q = 1.602176634e-19;

/** The Boltzmann constant, `J⋅K^(−1)`. */
export const k = 1.380649e-23;

/** Saturation current temperature exponent. */
export const Xti = 3.0;

/** Energy gap. */
export const Eg = 1.11;

/** A precomputed value. */
export const twoOverPi = 2 / Math.PI;

/** A precomputed value. */
export const piOverTwo = Math.PI / 2;

/**
 * A very small conductance added across nonlinear devices
 * to prevent nodes from floating if a device is turned completely off.
 */
export const gMin = 1e-12;
