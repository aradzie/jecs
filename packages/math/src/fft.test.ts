import { test } from "node:test";
import { deepEqual } from "rich-assert";
import { fft } from "./fft.js";

test("impulse", () => {
  const data = new Float64Array(2 * 8);
  data[0] = 1.0;
  fft(data);
  deepEqual(data, new Float64Array([1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0]));
});

test("dc", () => {
  const data = new Float64Array(2 * 8);
  for (let i = 0; i < 8; ++i) {
    data[2 * i] = 1.0;
    data[2 * i + 1] = 0.0;
  }
  fft(data);
  deepEqual(data, new Float64Array([8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]));
});

test("cos", () => {
  const numSamples = 16;
  const frequency = 2;
  const sampleRate = 16;
  const data = new Float64Array(2 * numSamples);
  for (let i = 0; i < numSamples; i++) {
    const time = i / sampleRate;
    data[2 * i] = Math.cos(2 * Math.PI * frequency * time);
    data[2 * i + 1] = 0;
  }
  fft(data);
  for (let i = 0; i < numSamples * 2; i++) {
    const v = Math.round(data[i] * 1000) / 1000;
    data[i] = v === 0 ? 0 : v;
  }
  // prettier-ignore
  deepEqual(
    data,
    new Float64Array([
      0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0,
    ]),
  );
});
