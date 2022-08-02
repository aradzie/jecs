import type { Content, Result } from "./types.js";

const worker = new Worker(new URL("./worker", import.meta.url));

export function exec(content: string): Promise<Result> {
  return new Promise<Result>((resolve, reject) => {
    worker.onmessage = (ev: MessageEvent<Result>): void => {
      resolve(ev.data);
    };
    worker.onerror = (ev: ErrorEvent): void => {
      reject(new Error(ev.message));
    };
    worker.postMessage({ content } as Content);
  });
}
