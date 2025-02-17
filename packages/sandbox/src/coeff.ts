import { Sle, SleMethod } from "@jecs/math";
import { type Coeff } from "./state.js";

/**
 * Computes Adams-Bashforth coefficients of the given order.
 */
export const adamsBashforthCoeff = (order: number): Coeff => {
  if (order === 0) {
    return [];
  }
  const sle = new Sle(order);
  for (let i = 0; i < order; i++) {
    for (let j = 0; j < order; j++) {
      sle.A[i][j] = j ** i;
    }
    sle.b[i] = (-1) ** i / (i + 1);
  }
  sle.solve(SleMethod.Gauss);
  const coeff: [number, number][] = [];
  for (let i = 0; i < order; i++) {
    coeff.push([i === 0 ? 1 : 0, sle.x[i]]);
  }
  return coeff;
};

/**
 * Computes Adams-Moulton coefficients of the given order.
 */
export const adamsMoultonCoeff = (order: number): Coeff => {
  if (order === 0) {
    return [];
  }
  if (order === 1) {
    // same as Backward Euler
    return [
      [0, 1],
      [1, 0],
    ];
  }
  const sle = new Sle(order);
  for (let i = 0; i < order; i++) {
    for (let j = 0; j < order; j++) {
      sle.A[i][j] = (j - 1) ** i;
    }
    sle.b[i] = (-1) ** i / (i + 1);
  }
  sle.solve(SleMethod.Gauss);
  const coeff: [number, number][] = [];
  for (let i = 0; i < order; i++) {
    coeff.push([i === 1 ? 1 : 0, sle.x[i]]);
  }
  return coeff;
};

export const adamsBashforthCoeffList: readonly Coeff[] = [0, 1, 2, 3, 4, 5, 6].map((order) =>
  adamsBashforthCoeff(order),
);

export const adamsMoultonCoeffList: readonly Coeff[] = [0, 1, 2, 3, 4, 5, 6].map((order) =>
  adamsMoultonCoeff(order),
);

export const gearCoeffList: readonly Coeff[] = [
  [
    // padding
  ],
  [
    // same as Backward Euler
    [0, 1],
    [1, 0],
  ],
  [
    [0, 2 / 3],
    [+4 / 3, 0],
    [-1 / 3, 0],
  ],
  [
    [0, 6 / 11],
    [+18 / 11, 0],
    [-9 / 11, 0],
    [+2 / 11, 0],
  ],
  [
    [0, 12 / 25],
    [+48 / 25, 0],
    [-36 / 25, 0],
    [+16 / 25, 0],
    [-3 / 25, 0],
  ],
  [
    [0, 60 / 137],
    [+300 / 137, 0],
    [-300 / 137, 0],
    [+200 / 137, 0],
    [-75 / 137, 0],
    [+12 / 137, 0],
  ],
  [
    [0, 60 / 147],
    [+360 / 147, 0],
    [-450 / 147, 0],
    [+400 / 147, 0],
    [-225 / 147, 0],
    [+72 / 147, 0],
    [-10 / 147, 0],
  ],
];
