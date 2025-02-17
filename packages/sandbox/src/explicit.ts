import { adamsBashforthCoeffList } from "./coeff.js";
import { type Explicit, makeExplicit } from "./state.js";

/**
 * Single step, 1st order Forward Euler method.
 */
export const forwardEuler: Explicit = (state, f) => {
  const h = state.h(0);
  const y1 = state.y(1);
  const f1 = state.f(1);
  return y1 + h * f1;
};

/**
 * Single-step, 2nd order Runge-Kutta method.
 */
export const rungeKutta2: Explicit = (state, f) => {
  const h = state.h(0);
  const x1 = state.x(1);
  const y1 = state.y(1);
  const k1 = f(x1, y1);
  const k2 = f(x1 + h, y1 + h * k1);
  return y1 + h * (k1 / 2 + k2 / 2);
};

/**
 * Single-step, 4th order Runge-Kutta method.
 */
export const rungeKutta4: Explicit = (state, f) => {
  const h = state.h(0);
  const x1 = state.x(1);
  const y1 = state.y(1);
  const h2 = h / 2;
  const k1 = f(x1, y1);
  const k2 = f(x1 + h2, y1 + h2 * k1);
  const k3 = f(x1 + h2, y1 + h2 * k2);
  const k4 = f(x1 + h, y1 + h * k3);
  return y1 + h * (k1 / 6 + k2 / 3 + k3 / 3 + k4 / 6);
};

/**
 * Creates and returns the Adams-Bashforth method of the given order.
 *
 * The pth-order Adams-Bashforth method is an explicit method that uses the most recent information
 * as well as p−1 "historical" points to fit the polynomial to.
 *
 * The pth-order Adams-Moulton method is an implicit method that fits the polynomial to the point
 * to be determined next, the current point, and p−2 "historical" points.
 *
 * Therefore, the pth-order AB method is a p-step method, while the pth-order AM method
 * is a p−1-step method.
 */
export const adamsBashforth = (order: number): Explicit =>
  makeExplicit("adamsBashforth", order, adamsBashforthCoeffList);

export const noPredictor: Explicit = (state, f) => state.y(1);
