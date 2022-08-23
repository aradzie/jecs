import type { Func } from "./func.js";

export const MIN_ORDER = 1;
export const MAX_ORDER = 5;

export type Coeff = readonly (readonly [a: number, b: number])[];

export class Step {
  h!: number;
  x!: number;
  y!: number;

  constructor() {
    this.reset();
  }

  reset(): void {
    this.h = NaN;
    this.x = NaN;
    this.y = NaN;
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

  setH(h: number): void {
    this.step(0).h = h;
  }

  setX(x: number): void {
    this.step(0).x = x;
  }

  setY(y: number): void {
    this.step(0).y = y;
  }

  explicit(coeff: Coeff, f: Func): number {
    let y = 0;
    for (let i = 0; i < coeff.length; i++) {
      const [a, b] = coeff[i];
      const step = this.step(i + 1);
      y += a * step.y + b * step.h * f(step.x, step.y);
    }
    return y;
  }

  implicit(coeff: Coeff, f: Func): number {
    let y = 0;
    for (let i = 0; i < coeff.length; i++) {
      const [a, b] = coeff[i];
      const step = this.step(i);
      y += a * step.y + b * step.h * f(step.x, step.y);
    }
    return y;
  }
}
