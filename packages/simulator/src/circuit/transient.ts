import { rotateRight } from "../util/array.js";

export enum DiffMethod {
  Euler,
  Trapezoidal,
  Gear,
}

export type DiffOwner = {
  readonly diffs: readonly Diff[];
};

const sTran = Symbol("tran");
const sIndex = Symbol("index");

export class Diff {
  private [sTran]!: Tran;
  private [sIndex]!: number;

  V = 0;
  C = 0;
  I = 0;
  Geq = 0;
  Ieq = 0;

  diff(V: number, C: number): void {
    this[sTran].diff(this, V, C);
  }
}

export const MIN_ORDER = 1;
export const MAX_ORDER = 6;

type Step = {
  time: number;
  delta: number;
  coeff: number;
  states: State[];
};

type State = {
  V: number;
  C: number;
  I: number;
};

export class Tran {
  private readonly steps: Step[] = [];
  private readonly diffs: Diff[] = [];
  private method!: DiffMethod;
  private order!: number;

  constructor(devices: readonly DiffOwner[] = []) {
    for (let i = 0; i <= MAX_ORDER; i++) {
      this.steps.push({
        time: 0,
        delta: 0,
        coeff: 0,
        states: [],
      });
    }
    for (const { diffs } of devices) {
      this.register(diffs);
    }
    this.setMethod(DiffMethod.Euler, 1);
  }

  register(list: readonly Diff[]): void {
    const { steps, diffs } = this;
    for (const diff of list) {
      diff[sTran] = this;
      diff[sIndex] = diffs.length;
      diffs.push(diff);
      for (const step of steps) {
        step.states.push({ V: 0, C: 0, I: 0 });
      }
    }
  }

  setMethod(method: DiffMethod, order: number): void {
    switch (method) {
      case DiffMethod.Euler:
        this.method = DiffMethod.Euler;
        this.order = 1;
        break;
      case DiffMethod.Trapezoidal:
        this.method = DiffMethod.Trapezoidal;
        this.order = 2;
        break;
      case DiffMethod.Gear:
        order = Math.max(MIN_ORDER, Math.min(MAX_ORDER, order));
        switch (order) {
          case 1:
            this.method = DiffMethod.Euler;
            this.order = 1;
            break;
          default:
            this.method = DiffMethod.Gear;
            this.order = order;
            break;
        }
        break;
    }
  }

  nextStep(time: number, delta: number): void {
    const { steps } = this;
    rotateRight(steps);
    this.computeCoeff(time, delta);
  }

  private computeCoeff(time: number, delta: number): void {
    const { steps } = this;
    steps[0].time = time;
    steps[0].delta = delta;
    switch (this.method) {
      case DiffMethod.Euler:
        steps[0].coeff = +1 / delta;
        steps[1].coeff = -1 / delta;
        break;
      case DiffMethod.Trapezoidal:
        steps[0].coeff = +2 / delta;
        steps[1].coeff = -2 / delta;
        break;
      case DiffMethod.Gear:
        for (let i = 0; i <= MAX_ORDER; i++) {
          steps[i].coeff = 0;
        }
        break;
    }
  }

  diff(diff: Diff, V: number, C: number): void {
    switch (this.method) {
      case DiffMethod.Euler:
        this.diffEuler(diff, V, C);
        break;
      case DiffMethod.Trapezoidal:
        this.diffTrapezoidal(diff, V, C);
        break;
      case DiffMethod.Gear:
        this.diffGear(diff, V, C);
        break;
    }
  }

  private diffEuler(diff: Diff, V: number, C: number): void {
    const { steps } = this;
    const index = diff[sIndex];
    const step0 = steps[0];
    const coeff0 = step0.coeff;
    const state0 = step0.states[index];
    const step1 = steps[1];
    const coeff1 = step1.coeff;
    const state1 = step1.states[index];

    const Geq = coeff0 * C;
    const Ieq = coeff1 * state1.V * state1.C;
    const I = coeff0 * C * V + Ieq;

    diff.V = state0.V = V;
    diff.C = state0.C = C;
    diff.I = state0.I = I;
    diff.Geq = Geq;
    diff.Ieq = Ieq;
  }

  private diffTrapezoidal(diff: Diff, V: number, C: number): void {
    const { steps } = this;
    const index = diff[sIndex];
    const step0 = steps[0];
    const coeff0 = step0.coeff;
    const state0 = step0.states[index];
    const step1 = steps[1];
    const coeff1 = step1.coeff;
    const state1 = step1.states[index];

    const Geq = coeff0 * C;
    const Ieq = coeff1 * state1.V * state1.C - state1.I;
    const I = coeff0 * C * V + Ieq;

    diff.V = state0.V = V;
    diff.C = state0.C = C;
    diff.I = state0.I = I;
    diff.Geq = Geq;
    diff.Ieq = Ieq;
  }

  private diffGear(diff: Diff, V: number, C: number): void {
    const { steps, order } = this;
    const index = diff[sIndex];
    const step0 = steps[0];
    const coeff0 = step0.coeff;
    const state0 = step0.states[index];

    const Geq = coeff0 * C;
    let Ieq = 0;
    for (let i = 1; i <= order; i++) {
      const stepI = steps[i];
      const coeffI = stepI.coeff;
      const stateI = stepI.states[index];
      Ieq += coeffI * stateI.V * stateI.C;
    }
    const I = coeff0 * C * V + Ieq;

    diff.V = state0.V = V;
    diff.C = state0.C = C;
    diff.I = state0.I = I;
    diff.Geq = Geq;
    diff.Ieq = Ieq;
  }

  private getState(diff: Diff, step: number): State {
    return this.steps[step].states[diff[sIndex]];
  }
}
