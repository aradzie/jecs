import { getUnitSymbol, type Unit } from "./unit.js";

export const humanizeNumber = (value: number, unit: string | Unit = ""): string => {
  if (!Number.isFinite(value)) {
    if (value !== value) {
      return "NaN";
    }
    if (value === Infinity) {
      return "+Infinity";
    }
    if (value === -Infinity) {
      return "-Infinity";
    }
    throw new TypeError();
  }
  const f = (n: number): string => String(Math.round(n * 1000) / 1000);
  const unitName = getUnitSymbol(unit);
  const absValue = Math.abs(value);
  if (absValue < 1e-15) {
    return `0${unitName}`;
  }
  if (absValue < 1e-9) {
    return `${f(value * 1e12)}p${unitName}`;
  }
  if (absValue < 1e-6) {
    return `${f(value * 1e9)}n${unitName}`;
  }
  if (absValue < 1e-3) {
    return `${f(value * 1e6)}μ${unitName}`;
  }
  if (absValue < 1) {
    return `${f(value * 1e3)}m${unitName}`;
  }
  if (absValue < 1e3) {
    return `${f(value)}${unitName}`;
  }
  if (absValue < 1e6) {
    return `${f(value * 1e-3)}k${unitName}`;
  }
  if (absValue < 1e9) {
    return `${f(value * 1e-6)}M${unitName}`;
  }
  return `${f(value * 1e-9)}G${unitName}`;
};

export type FormatNumber = (value: number) => string;

export const toString = (): FormatNumber => {
  return (value): string => {
    if (!Number.isFinite(value)) {
      if (value !== value) {
        return "NaN";
      }
      if (value === Infinity) {
        return "+Infinity";
      }
      if (value === -Infinity) {
        return "-Infinity";
      }
      throw new TypeError();
    }
    return String(value);
  };
};

export const toExponential = (fractionDigits = 10): FormatNumber => {
  return (value: number): string => {
    if (!Number.isFinite(value)) {
      if (value !== value) {
        return "NaN";
      }
      if (value === Infinity) {
        return "+Infinity";
      }
      if (value === -Infinity) {
        return "-Infinity";
      }
      throw new TypeError();
    }
    let s = value.toExponential(fractionDigits);
    if (value >= 0) {
      s = "+" + s;
    }
    if (s.length === fractionDigits + 6) {
      return s.substring(0, fractionDigits + 5) + "00" + s.substring(fractionDigits + 5);
    }
    if (s.length === fractionDigits + 7) {
      return s.substring(0, fractionDigits + 5) + "0" + s.substring(fractionDigits + 5);
    }
    return s;
  };
};
