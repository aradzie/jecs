import type { Func } from "./func.js";

/**
 * Explicit method.
 */
export type Explicit = {
  (state: State, f: Func): number;
};

/**
 * Implicit method.
 */
export type Implicit = {
  (state: State, f: Func): number;
};

export const MIN_ORDER = 1;
export const MAX_ORDER = 5;

export type Coeff = readonly (readonly [a: number, b: number])[];

export class Step {
  h!: number;
  x!: number;
  y!: number;
  f!: number;

  constructor() {
    this.reset();
  }

  reset(): void {
    this.h = NaN;
    this.x = NaN;
    this.y = NaN;
    this.f = NaN;
  }
}

export class State {
  readonly steps = new Array<Step>(MAX_ORDER + 1);
  index = 0;

  constructor() {
    const { steps } = this;
    const { length } = steps;
    for (let i = 0; i < length; i++) {
      steps[i] = new Step();
    }
  }

  reset(): void {
    const { steps } = this;
    for (const step of steps) {
      step.reset();
    }
    this.index = 0;
  }

  shift(): void {
    const { steps } = this;
    const { length } = steps;
    const s = steps[length - 1];
    for (let i = length - 1; i > 0; i--) {
      steps[i] = steps[i - 1];
    }
    steps[0] = s;
    s.reset();
    this.index += 1;
  }

  step(n: number): Step {
    return this.steps[n];
  }

  h(n: number): number {
    return this.step(n).h;
  }

  x(n: number): number {
    return this.step(n).x;
  }

  y(n: number): number {
    return this.step(n).y;
  }

  f(n: number): number {
    return this.step(n).f;
  }

  setH(h: number): void {
    this.step(0).h = h;
  }

  setX(x: number): void {
    this.step(0).x = x;
  }

  setY(y: number): void {
    this.step(0).y = y;
  }

  setF(f: number): void {
    this.step(0).f = f;
  }

  explicit(coeff: Coeff): number {
    let y = 0;
    for (let i = 0; i < coeff.length; i++) {
      const [a, b] = coeff[i];
      const step = this.step(i + 1);
      y += a * step.y + b * step.h * step.f;
    }
    if (!Number.isFinite(y)) {
      throw new TypeError("Overflow");
    }
    return y;
  }

  implicit(coeff: Coeff): number {
    let y = 0;
    for (let i = 0; i < coeff.length; i++) {
      const [a, b] = coeff[i];
      const step = this.step(i);
      y += a * step.y + b * step.h * step.f;
    }
    if (!Number.isFinite(y)) {
      throw new TypeError("Overflow");
    }
    return y;
  }
}

export const makeExplicit = (name: string, order: number, coeff: readonly Coeff[]): Explicit => {
  if (!Number.isInteger(order) || order < 2 || order >= coeff.length) {
    throw new Error();
  }
  const solver: Explicit = (state, f) => {
    return state.explicit(coeff[Math.min(state.index, order)]);
  };
  Object.defineProperties(solver, {
    order: { value: order, writable: false },
    name: { value: `${name}${order}`, writable: false },
  });
  return solver;
};

export const makeImplicit = (name: string, order: number, coeff: readonly Coeff[]): Explicit => {
  if (!Number.isInteger(order) || order < 2 || order >= coeff.length) {
    throw new Error();
  }
  const solver: Explicit = (state, f) => {
    return state.implicit(coeff[Math.min(state.index, order)]);
  };
  Object.defineProperties(solver, {
    order: { value: order, writable: false },
    name: { value: `${name}${order}`, writable: false },
  });
  return solver;
};
