export const euler = "euler" as const;
export const trapezoidal = "trapezoidal" as const;

export type Method = typeof euler | typeof trapezoidal;

export const method: Method = "euler";
