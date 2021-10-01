export enum Unit {
  UNITLESS,
  AMPERE,
  COULOMB,
  FARAD,
  HENRY,
  HERTZ,
  KELVIN,
  METER,
  OHM,
  SECOND,
  SIEMENS,
  VOLT,
  WATT,
}

export function getUnitSymbol(unit: Unit): string {
  switch (unit) {
    case Unit.UNITLESS:
      return "";
    case Unit.AMPERE:
      return "A";
    case Unit.COULOMB:
      return "C";
    case Unit.FARAD:
      return "F";
    case Unit.HENRY:
      return "H";
    case Unit.HERTZ:
      return "Hz";
    case Unit.KELVIN:
      return "K";
    case Unit.METER:
      return "m";
    case Unit.OHM:
      return "Ω";
    case Unit.SECOND:
      return "s";
    case Unit.SIEMENS:
      return "S";
    case Unit.VOLT:
      return "V";
    case Unit.WATT:
      return "W";
  }
}

export function celsiusToKelvin(t: number): number {
  return t + 273.15;
}

export function kelvinToCelsius(t: number): number {
  return t - 273.15;
}
