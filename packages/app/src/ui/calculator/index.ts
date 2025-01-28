import { FunctionComponent } from "preact";
import { CapacitiveReactance } from "./CapacitiveReactance.tsx";
import { InductiveReactance } from "./InductiveReactance.tsx";
import { ResistiveVoltageDivider } from "./ResistiveVoltageDivider.tsx";
import { Resonance } from "./Resonance.tsx";
import { Wavelength } from "./Wavelength.tsx";

export type Item = {
  readonly name: string;
  readonly component: FunctionComponent;
};

export const calculators: readonly Item[] = [
  { name: "Resistive voltage divider", component: ResistiveVoltageDivider },
  { name: "Capacitive reactance", component: CapacitiveReactance },
  { name: "Inductive reactance", component: InductiveReactance },
  { name: "LC resonance", component: Resonance },
  { name: "Wavelength and frequency", component: Wavelength },
];
