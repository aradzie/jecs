import type { DrawFunction } from "../ui/canvas";

export interface Part {
  readonly title: string;
  readonly draw: DrawFunction;
}

export const resistor: Part = {
  title: "Resistor",
  draw: () => {},
};

export const capacitor: Part = {
  title: "Capacitor",
  draw: () => {},
};

export const inductor: Part = {
  title: "Inductor",
  draw: () => {},
};

export const diode: Part = {
  title: "Diode",
  draw: () => {},
};

export const parts: readonly Part[] = [resistor, capacitor, inductor, diode];
