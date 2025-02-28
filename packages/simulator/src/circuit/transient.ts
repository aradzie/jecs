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

export const minOrder = 1;
export const maxOrder = 6;

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
  for (let i = 0; i <= maxOrder + 1; i++) {
    list.push(new Sle(i));
  }
  return list;
})();

export class Tran {
  readonly #diffs: Diff[] = [];
  readonly #steps: Step[] = [];
  readonly #coeff = new Float64Array(maxOrder + 1);
  #index = 0;
  #confMethod!: DiffMethod; // user requested method
  #confOrder!: number; // user requested order
  #method!: DiffMethod; // current method
  #order!: number; // current order

  constructor(devices: readonly DiffOwner[] = []) {
    for (let i = 0; i < maxOrder + 1; i++) {
      this.#steps.push({ time: 0, delta: 0, states: [] });
    }
    for (const { diffs } of devices) {
      for (const diff of diffs) {
        diff[sTran] = this;
        diff[sIndex] = this.#diffs.length;
        this.#diffs.push(diff);
        for (const step of this.#steps) {
          step.states.push({ V: 0, C: 0, I: 0 });
        }
      }
    }
    this.setMethod(DiffMethod.Gear, maxOrder);
  }

  setMethod(method: DiffMethod, order: number): void {
    switch (method) {
      case DiffMethod.Euler:
        this.#confMethod = DiffMethod.Euler;
        this.#confOrder = 1;
        break;
      case DiffMethod.Trapezoidal:
        this.#confMethod = DiffMethod.Trapezoidal;
        this.#confOrder = 2;
        break;
      case DiffMethod.Gear:
        order = Math.max(minOrder, Math.min(maxOrder, order));
        switch (order) {
          case 1:
            this.#confMethod = DiffMethod.Euler;
            this.#confOrder = 1;
            break;
          default:
            this.#confMethod = DiffMethod.Gear;
            this.#confOrder = order;
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
    switch (this.#confMethod) {
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
          this.#order = Math.min(this.#index, this.#confOrder);
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
    const state0 = this.#steps[0].states[index];
    const state1 = this.#steps[1].states[index];

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
    const state0 = this.#steps[0].states[index];
    const state1 = this.#steps[1].states[index];

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
    const state0 = this.#steps[0].states[index];

    const Geq = this.#coeff[0] * C;
    let Ieq = 0;
    for (let n = 1; n < this.#order + 1; n++) {
      const stateN = this.#steps[n].states[index];
      Ieq += this.#coeff[n] * stateN.V * stateN.C;
    }
    const I = this.#coeff[0] * C * V + Ieq;

    diff.V = state0.V = V;
    diff.C = state0.C = C;
    diff.I = state0.I = I;
    diff.Geq = Geq;
    diff.Ieq = Ieq;
  }
}
