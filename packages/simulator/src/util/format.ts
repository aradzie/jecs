import { getUnitSymbol, Unit } from "./unit.js";

export const formatNumber = (value: number, unit: string | Unit = Unit.UNITLESS): string => {
  const f = (n: number): string => String(Math.round(n * 1000) / 1000);
  const unitName = getUnitSymbol(unit);
  if (!Number.isFinite(value)) {
    return `${value}`;
  }
  const a = Math.abs(value);
  if (a < 1e-15) {
    return `0${unitName}`;
  }
  if (a < 1e-9) {
    return `${f(value * 1e12)}p${unitName}`;
  }
  if (a < 1e-6) {
    return `${f(value * 1e9)}n${unitName}`;
  }
  if (a < 1e-3) {
    return `${f(value * 1e6)}μ${unitName}`;
  }
  if (a < 1) {
    return `${f(value * 1e3)}m${unitName}`;
  }
  if (a < 1e3) {
    return `${f(value)}${unitName}`;
  }
  if (a < 1e6) {
    return `${f(value * 1e-3)}k${unitName}`;
  }
  if (a < 1e9) {
    return `${f(value * 1e-6)}M${unitName}`;
  }
  return `${f(value * 1e-9)}G${unitName}`;
};

export const toExponential = (value: number, fractionDigits: number): string => {
  const s = value.toExponential(fractionDigits);
  const k = value < 0 ? 1 : 0;
  if (s.length === fractionDigits + 5 + k) {
    return s.substring(0, fractionDigits + 4 + k) + "0" + s.substring(fractionDigits + 4 + k);
  } else {
    return s;
  }
};
