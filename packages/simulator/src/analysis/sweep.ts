import { Props, type PropsSchema } from "../circuit/index.js";
import { humanizeNumber } from "../util/format.js";

export class Sweep implements Iterable<number> {
  static readonly propsSchema: PropsSchema = {
    type: Props.string({
      range: ["lin", "log"],
      title: "parameter sweep type",
    }),
    start: Props.number({
      range: ["real"],
      title: "parameter start value",
    }),
    stop: Props.number({
      range: ["real"],
      title: "parameter stop value",
    }),
    points: Props.number({
      range: ["integer", ">", 1],
      title: "number of points",
    }),
  };

  static from(id: string, props: Props): Sweep {
    const sweep = new Sweep(id);
    sweep.props.from(props);
    return sweep;
  }

  readonly props = new Props(Sweep.propsSchema);

  constructor(readonly id: string) {}

  *[Symbol.iterator](): Iterator<number> {
    const { props } = this;
    yield* Sweep.iter(props);
  }

  static iter(props: Props): Iterable<number> {
    const type = props.getString("type");
    const start = props.getNumber("start");
    const stop = props.getNumber("stop");
    const points = props.getNumber("points");
    switch (type) {
      case "lin":
        return Sweep.linIter(start, stop, points);
      case "log": {
        return Sweep.logIter(start, stop, points);
      }
      default:
        throw new TypeError();
    }
  }

  static *linIter(start: number, stop: number, points: number): Iterable<number> {
    const step = (stop - start) / (points - 1);
    for (let i = 0; i < points; i++) {
      yield start + i * step;
    }
  }

  static *logIter(start: number, stop: number, points: number): Iterable<number> {
    const step = (Math.log(Math.abs(stop)) - Math.log(Math.abs(start))) / (points - 1);
    for (let i = 0; i < points; i++) {
      yield start * Math.exp(i * step);
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
  const stepName = ({ sweep: { id }, value }: Step): string => `${id}=${humanizeNumber(value)}`;
  return `"${steps.map(stepName).join(", ")}"`;
};
