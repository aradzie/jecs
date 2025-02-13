import { TransformOp } from "./transform.ts";

export type Dir = "h" | "v";

export const transformDir = (dir: Dir, op: TransformOp): Dir => {
  switch (op) {
    case "rl":
      switch (dir) {
        case "h":
          return "v";
        case "v":
          return "h";
      }
      break;
    case "rr":
      switch (dir) {
        case "h":
          return "v";
        case "v":
          return "h";
      }
      break;
  }
  return dir;
};
