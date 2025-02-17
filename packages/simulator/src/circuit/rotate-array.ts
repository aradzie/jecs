export const rotateRight = <T>(arr: T[]): void => {
  const { length } = arr;
  const last = arr[length - 1];
  for (let i = length - 1; i > 0; i--) {
    arr[i] = arr[i - 1];
  }
  arr[0] = last;
};

export const rotateLeft = <T>(arr: T[]): void => {
  const { length } = arr;
  const first = arr[0];
  for (let i = 0; i < length - 1; i++) {
    arr[i] = arr[i + 1];
  }
  arr[length - 1] = first;
};
