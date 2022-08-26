import { adamsBashforth, forwardEuler, noPredictor, rungeKutta2, rungeKutta4 } from "./explicit.js";
import { adamsMoulton, backwardEuler, gear, simpson, trapezoidal } from "./implicit.js";
import { ExactMethod, ExplicitMethod, ImplicitMethod, type Method } from "./method.js";

export const EXACT = new ExactMethod();
export const FE = new ExplicitMethod(forwardEuler);
export const RK2 = new ExplicitMethod(rungeKutta2);
export const RK4 = new ExplicitMethod(rungeKutta4);
export const AB2 = new ExplicitMethod(adamsBashforth(2));
export const AB5 = new ExplicitMethod(adamsBashforth(5));
export const SIMPSON = new ImplicitMethod(simpson, noPredictor);
export const SIMPSON_AB2 = new ImplicitMethod(simpson, adamsBashforth(2));
export const BE = new ImplicitMethod(backwardEuler, noPredictor);
export const BE_FE = new ImplicitMethod(backwardEuler, forwardEuler);
export const BE_RK2 = new ImplicitMethod(backwardEuler, rungeKutta2);
export const BE_RK4 = new ImplicitMethod(backwardEuler, rungeKutta4);
export const TR = new ImplicitMethod(trapezoidal, noPredictor);
export const TR_FE = new ImplicitMethod(trapezoidal, forwardEuler);
export const TR_RK2 = new ImplicitMethod(trapezoidal, rungeKutta2);
export const TR_RK4 = new ImplicitMethod(trapezoidal, rungeKutta4);
export const AM2 = new ImplicitMethod(adamsMoulton(2), noPredictor);
export const AM5 = new ImplicitMethod(adamsMoulton(5), noPredictor);
export const AM2_AB2 = new ImplicitMethod(adamsMoulton(2), adamsBashforth(2));
export const AM5_AB5 = new ImplicitMethod(adamsMoulton(5), adamsBashforth(5));
export const GE2_AB2 = new ImplicitMethod(gear(2), adamsBashforth(2));
export const GE5_AB5 = new ImplicitMethod(gear(5), adamsBashforth(5));

export const methods: readonly Method[] = [
  EXACT,
  FE,
  RK2,
  RK4,
  AB2,
  AB5,
  SIMPSON,
  SIMPSON_AB2,
  BE,
  BE_FE,
  BE_RK2,
  BE_RK4,
  TR,
  TR_FE,
  TR_RK2,
  TR_RK4,
  AM2,
  AM5,
  AM2_AB2,
  AM5_AB5,
  GE2_AB2,
  GE5_AB5,
];
