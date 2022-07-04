export const linSpace = (start: number, stop: number, points: number): Float64Array => {
  if (!Number.isFinite(start)) {
    throw new TypeError();
  }
  if (!Number.isFinite(stop)) {
    throw new TypeError();
  }
  if (!Number.isInteger(points) || points < 2) {
    throw new TypeError();
  }
  const v = new Float64Array(points);
  const step = (stop - start) / (points - 1);
  for (let i = 0; i < points; i++) {
    v[i] = start + i * step;
  }
  return v;
};

export const logSpace = (start: number, stop: number, points: number): Float64Array => {
  if (!Number.isFinite(start)) {
    throw new TypeError();
  }
  if (!Number.isFinite(stop)) {
    throw new TypeError();
  }
  if (!Number.isInteger(points) || points < 2) {
    throw new TypeError();
  }
  const v = new Float64Array(points);
  const step = (Math.log(Math.abs(stop)) - Math.log(Math.abs(start))) / (points - 1);
  for (let i = 0; i < points; i++) {
    v[i] = start * Math.exp(i * step);
  }
  return v;
};
