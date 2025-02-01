export type Unit = {
  name: string;
  type: "number";
  symbol: string;
};

export const units = {
  ampere: { name: "Ampere", type: "number", symbol: "A" },
  coulomb: { name: "Coulomb", type: "number", symbol: "C" },
  farad: { name: "Farad", type: "number", symbol: "F" },
  henry: { name: "Henry", type: "number", symbol: "H" },
  hertz: { name: "Hertz", type: "number", symbol: "Hz" },
  joule: { name: "Joule", type: "number", symbol: "J" },
  kelvin: { name: "Kelvin", type: "number", symbol: "K" },
  metre: { name: "metre", type: "number", symbol: "m" },
  ohm: { name: "Ohm", type: "number", symbol: "Ω" },
  radian: { name: "radian", type: "number", symbol: "rad" },
  second: { name: "second", type: "number", symbol: "s" },
  siemens: { name: "Siemens", type: "number", symbol: "S" },
  volt: { name: "Volt", type: "number", symbol: "V" },
  watt: { name: "Watt", type: "number", symbol: "W" },
} as const satisfies Record<string, Unit>;

export function getUnitSymbol(unit: string | Unit): string {
  return typeof unit === "string" ? unit : unit.symbol;
}

export function celsiusToKelvin(t: number): number {
  return t + 273.15;
}

export function kelvinToCelsius(t: number): number {
  return t - 273.15;
}
