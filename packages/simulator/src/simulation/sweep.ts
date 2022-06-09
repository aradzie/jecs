export class Sweep implements Iterable<number> {
  constructor(
    readonly instanceId: string,
    readonly propertyId: string,
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

    const step = (level: number): void => {
      if (level < length) {
        const sweep = sweeps[level];
        visitor.enter(sweep, level);
        for (const value of sweep) {
          visitor.set(sweep, value);
          step(level + 1);
        }
        visitor.leave(sweep, level);
      } else {
        visitor.end();
      }
    };

    step(0);
  }
}

export type Visitor = {
  /**
   * Enter the sweep. Sweeps are walked from left to right.
   * @param sweep Swept to enter.
   * @param level Sweep index.
   */
  readonly enter: (sweep: Sweep, level: number) => void;
  /**
   * Set swept variable value.
   * @param sweep The current sweep.
   * @param value Property value to set.
   */
  readonly set: (sweep: Sweep, value: number) => void;
  /**
   * Indicate that all sweeps have been visited.
   */
  readonly end: () => void;
  /**
   * Leave the sweep. Sweeps are walked from left to right.
   * @param sweep Swept to leave.
   * @param level Sweep index.
   */
  readonly leave: (sweep: Sweep, level: number) => void;
};
