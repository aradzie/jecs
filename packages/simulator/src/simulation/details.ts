import type { Unit } from "./props";

export type Details = readonly DetailsItem[];

export type DetailsItem = {
  readonly name: string;
  readonly value: number;
  readonly unit: Unit;
};
