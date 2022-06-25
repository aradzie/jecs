import { humanizeNumber } from "../util/format.js";

export class Sweep implements Iterable<number> {
  constructor(
    readonly variableId: string,
    readonly from: number,
    readonly to: number,
    readonly points: number,
  ) {}

  *[Symbol.iterator](): Iterator<number> {
    const { from, to, points } = this;
    const n = Math.max(2, Math.floor(points));
    const delta = (to - from) / (n - 1);
    for (let i = 0; i < n; i++) {
      yield from + i * delta;
    }
  }

  static walk(sweeps: readonly Sweep[], visitor: Visitor): void {
    const { length } = sweeps;
    const steps: Step[] = [];
    const step = (level: number): void => {
      if (level < length) {
        const sweep = sweeps[level];
        visitor.enter(sweep, level, steps);
        for (const value of sweep) {
          steps.push({ sweep, value });
          visitor.set(sweep, value);
          step(level + 1);
          steps.pop();
        }
        visitor.leave(sweep, level, steps);
      } else {
        visitor.end(steps);
      }
    };
    step(0);
  }
}

export type Step = {
  readonly sweep: Sweep;
  readonly value: number;
};

export type Visitor = {
  /**
   * Enter the sweep. Sweeps are walked from left to right.
   * @param sweep Swept to enter.
   * @param level Sweep index.
   */
  readonly enter: (sweep: Sweep, level: number, steps: Step[]) => void;
  /**
   * Set swept variable value.
   * @param sweep The current sweep.
   * @param value Property value to set.
   */
  readonly set: (sweep: Sweep, value: number) => void;
  /**
   * Indicate that all sweeps have been visited.
   */
  readonly end: (steps: Step[]) => void;
  /**
   * Leave the sweep. Sweeps are walked from left to right.
   * @param sweep Swept to leave.
   * @param level Sweep index.
   */
  readonly leave: (sweep: Sweep, level: number, steps: Step[]) => void;
};

export const groupName = (steps: readonly Step[]): string => {
  const stepName = ({ sweep: { variableId }, value }: Step): string =>
    `${variableId}=${humanizeNumber(value)}`;
  return `"${steps.map(stepName).join(", ")}"`;
};
