import { Sle, SleMethod } from "@jecs/math";
import { rotateRight } from "./rotate-array.js";

export enum DiffMethod {
  Euler = "euler",
  Trapezoidal = "trapezoidal",
  Gear = "gear",
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
  states: State[];
};

type State = {
  V: number;
  C: number;
  I: number;
};

const slePool: readonly Sle[] = (() => {
  const list = new Array<Sle>();
  for (let i = 0; i <= MAX_ORDER + 1; i++) {
    list.push(new Sle(i));
  }
  return list;
})();

export class Tran {
  readonly #diffs: Diff[] = [];
  readonly #steps: Step[] = [];
  readonly #coeff: Float64Array;
  #index: number;
  #configMethod!: DiffMethod; // user requested method
  #configOrder!: number; // user requested order
  #method!: DiffMethod; // current method
  #order!: number; // current order

  constructor(devices: readonly DiffOwner[] = []) {
    for (let i = 0; i < MAX_ORDER + 1; i++) {
      this.#steps.push({ time: 0, delta: 0, states: [] });
    }
    this.#coeff = new Float64Array(MAX_ORDER + 1);
    this.#index = 0;
    this.setMethod(DiffMethod.Gear, MAX_ORDER);
    for (const { diffs } of devices) {
      this.register(diffs);
    }
  }

  register(list: readonly Diff[]): void {
    for (const diff of list) {
      diff[sTran] = this;
      diff[sIndex] = this.#diffs.length;
      this.#diffs.push(diff);
      for (const step of this.#steps) {
        step.states.push({ V: 0, C: 0, I: 0 });
      }
    }
  }

  setMethod(method: DiffMethod, order: number): void {
    switch (method) {
      case DiffMethod.Euler:
        this.#configMethod = DiffMethod.Euler;
        this.#configOrder = 1;
        break;
      case DiffMethod.Trapezoidal:
        this.#configMethod = DiffMethod.Trapezoidal;
        this.#configOrder = 2;
        break;
      case DiffMethod.Gear:
        order = Math.max(MIN_ORDER, Math.min(MAX_ORDER, order));
        switch (order) {
          case 1:
            this.#configMethod = DiffMethod.Euler;
            this.#configOrder = 1;
            break;
          default:
            this.#configMethod = DiffMethod.Gear;
            this.#configOrder = order;
            break;
        }
        break;
    }
  }

  nextStep(time: number, delta: number): void {
    rotateRight(this.#steps);
    this.#index += 1;
    this.#computeOrder();
    this.#computeCoeff(time, delta);
  }

  #computeOrder(): void {
    switch (this.#configMethod) {
      case DiffMethod.Euler:
        this.#method = DiffMethod.Euler;
        this.#order = 1;
        break;
      case DiffMethod.Trapezoidal:
        if (this.#index < 2) {
          this.#method = DiffMethod.Euler;
          this.#order = 1;
        } else {
          this.#method = DiffMethod.Trapezoidal;
          this.#order = 2;
        }
        break;
      case DiffMethod.Gear:
        if (this.#index < 2) {
          this.#method = DiffMethod.Euler;
          this.#order = 1;
        } else {
          this.#method = DiffMethod.Gear;
          this.#order = Math.min(this.#index, this.#configOrder);
        }
        break;
    }
  }

  #computeCoeff(time: number, delta: number): void {
    this.#steps[0].time = time;
    this.#steps[0].delta = delta;
    switch (this.#method) {
      case DiffMethod.Euler: {
        this.#coeff[0] = +1 / delta;
        this.#coeff[1] = -1 / delta;
        break;
      }
      case DiffMethod.Trapezoidal: {
        this.#coeff[0] = +2 / delta;
        this.#coeff[1] = -2 / delta;
        break;
      }
      case DiffMethod.Gear: {
        const sle = slePool[this.#order + 1];
        const { A, x, b } = sle;
        sle.clear();
        for (let c = 0; c < this.#order + 1; c++) {
          A[0][c] = 1;
        }
        let hs = 0;
        for (let c = 0; c < this.#order; c++) {
          hs += this.#steps[c].delta;
          let a = 1;
          for (let r = 0; r < this.#order; r++) {
            a *= hs / this.#steps[0].delta;
            A[r + 1][c + 1] = a;
          }
        }
        b[1] = -1 / this.#steps[0].delta;
        sle.solve(SleMethod.Gauss);
        this.#coeff.set(x);
        break;
      }
    }
  }

  diff(diff: Diff, V: number, C: number): void {
    switch (this.#method) {
      case DiffMethod.Euler:
        this.#diffEuler(diff, V, C);
        break;
      case DiffMethod.Trapezoidal:
        this.#diffTrapezoidal(diff, V, C);
        break;
      case DiffMethod.Gear:
        this.#diffGear(diff, V, C);
        break;
    }
  }

  #diffEuler(diff: Diff, V: number, C: number): void {
    const index = diff[sIndex];
    const step0 = this.#steps[0];
    const state0 = step0.states[index];
    const step1 = this.#steps[1];
    const state1 = step1.states[index];

    const Geq = this.#coeff[0] * C;
    const Ieq = this.#coeff[1] * state1.V * state1.C;
    const I = this.#coeff[0] * C * V + Ieq;

    diff.V = state0.V = V;
    diff.C = state0.C = C;
    diff.I = state0.I = I;
    diff.Geq = Geq;
    diff.Ieq = Ieq;
  }

  #diffTrapezoidal(diff: Diff, V: number, C: number): void {
    const index = diff[sIndex];
    const step0 = this.#steps[0];
    const state0 = step0.states[index];
    const step1 = this.#steps[1];
    const state1 = step1.states[index];

    const Geq = this.#coeff[0] * C;
    const Ieq = this.#coeff[1] * state1.V * state1.C - state1.I;
    const I = this.#coeff[0] * C * V + Ieq;

    diff.V = state0.V = V;
    diff.C = state0.C = C;
    diff.I = state0.I = I;
    diff.Geq = Geq;
    diff.Ieq = Ieq;
  }

  #diffGear(diff: Diff, V: number, C: number): void {
    const index = diff[sIndex];
    const step0 = this.#steps[0];
    const state0 = step0.states[index];

    const Geq = this.#coeff[0] * C;
    let Ieq = 0;
    for (let i = 1; i < this.#order + 1; i++) {
      const stepI = this.#steps[i];
      const stateI = stepI.states[index];
      Ieq += this.#coeff[i] * stateI.V * stateI.C;
    }
    const I = this.#coeff[0] * C * V + Ieq;

    diff.V = state0.V = V;
    diff.C = state0.C = C;
    diff.I = state0.I = I;
    diff.Geq = Geq;
    diff.Ieq = Ieq;
  }
}
