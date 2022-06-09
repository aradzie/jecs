import { getUnitSymbol, Unit } from "./unit.js";

export function formatNumber(v: number, unit: string | Unit = Unit.UNITLESS): string {
  const unitName = getUnitSymbol(unit);
  if (!Number.isFinite(v)) {
    return `${v}`;
  }
  const a = Math.abs(v);
  if (a < 1e-15) {
    return `0${unitName}`;
  }
  if (a < 1e-9) {
    return `${format(v * 1e12)}p${unitName}`;
  }
  if (a < 1e-6) {
    return `${format(v * 1e9)}n${unitName}`;
  }
  if (a < 1e-3) {
    return `${format(v * 1e6)}μ${unitName}`;
  }
  if (a < 1) {
    return `${format(v * 1e3)}m${unitName}`;
  }
  if (a < 1e3) {
    return `${format(v)}${unitName}`;
  }
  if (a < 1e6) {
    return `${format(v * 1e-3)}k${unitName}`;
  }
  if (a < 1e9) {
    return `${format(v * 1e-6)}M${unitName}`;
  }
  return `${format(v * 1e-9)}G${unitName}`;
}

function format(n: number): string {
  return String(Math.round(n * 1000) / 1000);
}
