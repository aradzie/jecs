export const tRotate = 0x0004;
export const tMirrorX = 0x0002;
export const tMirrorY = 0x0001;

export type Transform = number;
export type TransformOp = "rl" | "rr" | "mx" | "my";

const rl = [
  /* 0                             => */ tRotate | tMirrorX | tMirrorY,
  /* tMirrorY                      => */ tRotate | tMirrorY,
  /* tMirrorX                      => */ tRotate | tMirrorX,
  /* tMirrorX | tMirrorY           => */ tRotate,
  /* tRotate                       => */ 0,
  /* tRotate | tMirrorY            => */ tMirrorX,
  /* tRotate | tMirrorX            => */ tMirrorY,
  /* tRotate | tMirrorX | tMirrorY => */ tMirrorX | tMirrorY,
] as const;

const rr = [
  /* 0                             => */ tRotate,
  /* tMirrorY                      => */ tRotate | tMirrorX,
  /* tMirrorX                      => */ tRotate | tMirrorY,
  /* tMirrorX | tMirrorY           => */ tRotate | tMirrorX | tMirrorY,
  /* tRotate                       => */ tMirrorX | tMirrorY,
  /* tRotate | tMirrorY            => */ tMirrorY,
  /* tRotate | tMirrorX            => */ tMirrorX,
  /* tRotate | tMirrorX | tMirrorY => */ 0,
] as const;

const mx = [
  /* 0                             => */ tMirrorX,
  /* tMirrorY                      => */ tMirrorX | tMirrorY,
  /* tMirrorX                      => */ 0,
  /* tMirrorX | tMirrorY           => */ tMirrorY,
  /* tRotate                       => */ tRotate | tMirrorX,
  /* tRotate | tMirrorY            => */ tRotate | tMirrorY | tMirrorX,
  /* tRotate | tMirrorX            => */ tRotate,
  /* tRotate | tMirrorX | tMirrorY => */ tRotate | tMirrorY,
] as const;

const my = [
  /* 0                             => */ tMirrorY,
  /* tMirrorY                      => */ 0,
  /* tMirrorX                      => */ tMirrorX | tMirrorY,
  /* tMirrorX | tMirrorY           => */ tMirrorX,
  /* tRotate                       => */ tRotate | tMirrorY,
  /* tRotate | tMirrorY            => */ tRotate,
  /* tRotate | tMirrorX            => */ tRotate | tMirrorX | tMirrorY,
  /* tRotate | tMirrorX | tMirrorY => */ tRotate | tMirrorX,
] as const;

export const nextTransform = (t: Transform, op: TransformOp): Transform => {
  switch (op) {
    case "rl":
      return rl[t] ?? 0;
    case "rr":
      return rr[t] ?? 0;
    case "mx":
      return mx[t] ?? 0;
    case "my":
      return my[t] ?? 0;
  }
  return 0;
};
