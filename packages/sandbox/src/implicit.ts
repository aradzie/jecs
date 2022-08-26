import { adamsMoultonCoeffList, gearCoeffList } from "./coeff.js";
import { Implicit, makeImplicit } from "./state.js";

/**
 * Single step, 1st order Backward Euler method.
 */
export const backwardEuler: Implicit = (state, f) => {
  const h = state.h(0);
  const y1 = state.y(1);
  const f0 = state.f(0);
  return y1 + h * f0;
};

/**
 * Single step, 2nd order Trapezoidal method.
 */
export const trapezoidal: Implicit = (state, f) => {
  const h = state.h(0);
  const y1 = state.y(1);
  const f0 = state.f(0);
  const f1 = state.f(1);
  return y1 + (h / 2) * (f0 + f1);
};

/**
 * Creates and returns the Adams-Moulton method of the given order.
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
export const adamsMoulton = (order: number): Implicit =>
  makeImplicit("adamsMoulton", order, adamsMoultonCoeffList);

export const gear = (order: number): Implicit => makeImplicit("gear", order, gearCoeffList);

export const noCorrector: Implicit = (state, f) => state.y(0);
