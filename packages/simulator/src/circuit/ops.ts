import type { Unit } from "../util/unit";

/**
 * Device operating point, such as diode voltage, etc.
 */
export type Op = {
  readonly name: string;
  readonly value: number;
  readonly unit: Unit;
};
