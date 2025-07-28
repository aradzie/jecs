export function fft(data: Float64Array): void {
  const { length } = data;
  const N = length / 2;
  const log2N = Math.log2(N);

  for (let i = 0; i < N; i++) {
    // Calculate the bit-reversed index 'j' for index 'i'.
    let j = 0;
    for (let bit = 0; bit < log2N; bit++) {
      if ((i >> bit) & 1) {
        // Check if the bit-th bit of i is 1.
        j |= 1 << (log2N - 1 - bit); // Set the corresponding reversed bit in j.
      }
    }
    // Swap elements only if j > i to avoid swapping twice.
    if (j > i) {
      const real = data[2 * i];
      data[2 * i] = data[2 * j];
      data[2 * j] = real;
      const imag = data[2 * i + 1];
      data[2 * i + 1] = data[2 * j + 1];
      data[2 * j + 1] = imag;
    }
  }

  for (let size = 2; size <= N; size *= 2) {
    const halfSize = size / 2;
    const angleStep = (-2.0 * Math.PI) / size;
    const cos = Math.cos(angleStep);
    const sin = Math.sin(angleStep);
    let tReal;
    let tImag;
    for (let k = 0; k < N; k += size) {
      let twiddleReal = 1.0;
      let twiddleImag = 0.0;
      for (let j = 0; j < halfSize; j++) {
        const aIndex = k + j;
        const bIndex = k + j + halfSize;
        const aReal = data[2 * aIndex];
        const aImag = data[2 * aIndex + 1];
        const bReal = data[2 * bIndex];
        const bImag = data[2 * bIndex + 1];
        tReal = twiddleReal * bReal - twiddleImag * bImag;
        tImag = twiddleImag * bReal + twiddleReal * bImag;
        data[2 * aIndex] = aReal + tReal;
        data[2 * aIndex + 1] = aImag + tImag;
        data[2 * bIndex] = aReal - tReal;
        data[2 * bIndex + 1] = aImag - tImag;
        tReal = twiddleReal * cos - twiddleImag * sin;
        tImag = twiddleReal * sin + twiddleImag * cos;
        twiddleReal = tReal;
        twiddleImag = tImag;
      }
    }
  }
}
