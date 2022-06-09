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

export type Form = number | Dc | Sin | Signal;

export type Signal = (time: number) => number;

export const makeSignal = (form: Form): Signal => {
  if (typeof form === "function") {
    return form;
  }
  if (typeof form === "number") {
    return (time) => form;
  }
  switch (form.type) {
    case "dc": {
      const { value } = form;
      return (time) => value;
    }
    case "sin": {
      const { offset, amplitude, frequency, phase } = form;
      const omega = 2 * Math.PI * frequency;
      const theta = (phase / 180) * Math.PI;
      return (time) => offset + amplitude * Math.sin(omega * time + theta);
    }
  }
};
