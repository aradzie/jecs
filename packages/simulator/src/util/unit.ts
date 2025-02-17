export type Unit = {
  name: string;
  symbol: string;
};

export const units = {
  ampere: { name: "Ampere", symbol: "A" },
  coulomb: { name: "Coulomb", symbol: "C" },
  farad: { name: "Farad", symbol: "F" },
  henry: { name: "Henry", symbol: "H" },
  hertz: { name: "Hertz", symbol: "Hz" },
  joule: { name: "Joule", symbol: "J" },
  kelvin: { name: "Kelvin", symbol: "K" },
  metre: { name: "metre", symbol: "m" },
  ohm: { name: "Ohm", symbol: "Ω" },
  radian: { name: "radian", symbol: "rad" },
  second: { name: "second", symbol: "s" },
  siemens: { name: "Siemens", symbol: "S" },
  volt: { name: "Volt", symbol: "V" },
  watt: { name: "Watt", symbol: "W" },
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
