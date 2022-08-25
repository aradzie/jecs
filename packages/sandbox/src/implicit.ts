import type { Func } from "./func.js";
import type { Coeff, State } from "./state.js";

/**
 * Implicit method.
 */
export type Implicit = {
  (state: State, f: Func): number;
};

/**
 * Single step, 1st order Backward Euler method.
 */
export const backwardEuler: Implicit = (state, f) => {
  const h = state.h(0);
  const x = state.x(0);
  const y = state.y(0);
  const y1 = state.y(1);
  return y1 + h * f(x, y);
};

/**
 * Single step, 2nd order Trapezoidal method.
 */
export const trapezoidal: Implicit = (state, f) => {
  const h = state.h(0);
  const x = state.x(0);
  const y = state.y(0);
  const x1 = state.x(1);
  const y1 = state.y(1);
  return y1 + (h / 2) * (f(x, y) + f(x1, y1));
};

const simpsonCoeff: Coeff = [
  [0, 1 / 3],
  [0, 4 / 3],
  [1, 1 / 3],
];

export const simpson: Implicit = (state, f) => {
  if (state.index < 2) {
    return trapezoidal(state, f);
  } else {
    return state.implicit(simpsonCoeff, f);
  }
};

const adamsMoultonCoeff: readonly Coeff[] = [
  [
    // padding
  ],
  [
    // same as Backward Euler
    [0, 1],
    [1, 0],
  ],
  [
    // same as Trapezoidal
    [0, +1 / 2],
    [1, +1 / 2],
  ],
  [
    [0, +5 / 12],
    [1, +8 / 12],
    [0, -1 / 12],
  ],
  [
    [0, +9 / 24],
    [1, +19 / 24],
    [0, -5 / 24],
    [0, +1 / 24],
  ],
  [
    [0, +251 / 720],
    [1, +646 / 720],
    [0, -264 / 720],
    [0, +106 / 720],
    [0, -19 / 720],
  ],
];

const adamsMoultonList: readonly Implicit[] = adamsMoultonCoeff.map((coeff, order) => {
  const adamsMoulton: Implicit = (state, f) => {
    if (state.index < order) {
      return adamsMoultonList[state.index](state, f);
    } else {
      return state.implicit(coeff, f);
    }
  };
  Object.defineProperties(adamsMoulton, {
    order: { value: order, writable: false },
    name: { value: `adamsMoulton${order}`, writable: false },
  });
  return adamsMoulton;
});

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
export const adamsMoulton = (order: number): Implicit => {
  if (!Number.isInteger(order) || order < 2 || order >= adamsMoultonList.length) {
    throw new Error();
  }
  return adamsMoultonList[order];
};

export const noCorrector: Implicit = (state, f) => state.y(0);
