import type { Explicit } from "./explicit.js";
import type { Func } from "./func.js";
import type { Implicit } from "./implicit.js";
import { State } from "./state.js";

const e = 1e-6;

export type Problem = {
  readonly f: Func;
  readonly h: number;
  readonly x1: number;
  readonly y1: number;
  readonly end: number;
};

export abstract class Method {
  readonly name: string;
  readonly state: State;
  iter: number;

  constructor(name: string) {
    this.name = name;
    this.state = new State();
    this.iter = 0;
  }

  protected abstract compute(f: Func): number;

  run({ f, h, x1, y1, end }: Problem): [x: number, y: number] {
    const { state } = this;
    this.iter = 0;
    state.reset();
    state.setH(h);
    state.setX(x1);
    state.setY(y1);
    while (true) {
      this.iter += 1;
      const x = state.x(0) + h;
      state.shift();
      state.setH(h);
      state.setX(x);
      state.setY(this.compute(f));
      if (x >= end) {
        break;
      }
    }
    return [state.x(0), state.y(0)];
  }
}

export class ExplicitMethod extends Method {
  constructor(readonly explicit: Explicit) {
    super(`${explicit.name}`);
  }

  protected override compute(f: Func): number {
    return this.explicit(this.state, f);
  }
}

export class ImplicitMethod extends Method {
  constructor(readonly corrector: Implicit, readonly predictor: Explicit) {
    super(`${corrector.name}/${predictor.name}`);
  }

  protected override compute(f: Func): number {
    const { state } = this;
    state.setY(this.predictor(this.state, f));
    while (true) {
      this.iter += 1;
      const y = this.corrector(this.state, f);
      if (Math.abs(state.y(0) - y) < e) {
        return y;
      }
      state.setY(y);
    }
  }
}

export class ExactMethod extends Method {
  constructor() {
    super("exact");
  }

  protected override compute(f: Func): number {
    return NaN;
  }

  override run({ f, h, x1, y1, end }: Problem): [x: number, y: number] {
    this.iter = 1;
    return [end, f.exact(end)];
  }
}
