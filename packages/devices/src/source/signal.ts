export type Dc = {
  readonly type: "dc";
  /** DC value, V. */
  readonly value: number;
};

export type Sin = {
  readonly type: "sin";
  /** DC offset, V. */
  readonly offset: number;
  /** Amplitude, V. */
  readonly amplitude: number;
  /** Frequency, Hz. */
  readonly frequency: number;
  /** Phase, degrees. */
  readonly phase: number;
};

export type Shape = number | Dc | Sin | Signal;

export type Signal = (time: number) => number;

export const makeSignal = (shape: Shape): Signal => {
  if (typeof shape === "function") {
    return shape;
  }
  if (typeof shape === "number") {
    return (time) => shape;
  }
  switch (shape.type) {
    case "dc": {
      const { value } = shape;
      return (time) => value;
    }
    case "sin": {
      const { offset, amplitude, frequency, phase } = shape;
      const omega = 2 * Math.PI * frequency;
      const theta = (phase / 180) * Math.PI;
      return (time) => offset + amplitude * Math.sin(omega * time + theta);
    }
  }
};
