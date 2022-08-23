import type { Func } from "./func.js";
import type { Coeff, State } from "./state.js";

/**
 * Explicit method.
 */
export type Explicit = {
  (state: State, f: Func): number;
};

/**
 * Single step, 1st order Forward Euler method.
 */
export const forwardEuler: Explicit = (state, f) => {
  const h = state.h(0);
  const x1 = state.x(1);
  const y1 = state.y(1);
  return y1 + h * f(x1, y1);
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

const adamsBashforthCoeff: readonly Coeff[] = [
  [
    // padding
  ],
  [
    // same as Forward Euler
    [1, 1],
  ],
  [
    [1, +3 / 2],
    [0, -1 / 2],
  ],
  [
    [1, +23 / 12],
    [0, -16 / 12],
    [0, +5 / 12],
  ],
  [
    [1, +55 / 24],
    [0, -59 / 24],
    [0, +37 / 24],
    [0, -9 / 24],
  ],
  [
    [1, +1901 / 720],
    [0, -2774 / 720],
    [0, +2616 / 720],
    [0, -1274 / 720],
    [0, +251 / 720],
  ],
];

const adamsBashforthList: readonly Explicit[] = adamsBashforthCoeff.map((coeff, order) => {
  const adamsBashforth: Explicit = (state, f) => {
    if (state.index < order) {
      return adamsBashforthList[state.index](state, f);
    } else {
      return state.explicit(coeff, f);
    }
  };
  Object.defineProperties(adamsBashforth, {
    order: { value: order, writable: false },
    name: { value: `adamsBashforth${order}`, writable: false },
  });
  return adamsBashforth;
});

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
export const adamsBashforth = (order: number): Explicit => {
  if (!Number.isInteger(order) || order < 2 || order >= adamsBashforthList.length) {
    throw new Error();
  }
  return adamsBashforthList[order];
};

export const noPredictor: Explicit = (state, f) => state.y(1);
