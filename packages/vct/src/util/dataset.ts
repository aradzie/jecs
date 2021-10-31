import { writeFileSync } from "fs";
import { join } from "path";

export function* points(start: number, end: number, n: number): Iterable<number> {
  if (n < 1) {
    throw new TypeError();
  }
  const delta = (end - start) / (n - 1);
  let v = start;
  while (n > 0) {
    yield v;
    n -= 1;
    v += delta;
  }
}

export class Dataset {
  private data: string[] = [];

  add(...points: number[]): void {
    this.data.push(points.map((point) => point.toExponential(10)).join(" "));
  }

  group(title: string): void {
    if (this.data.length > 0) {
      this.data.push("");
      this.data.push("");
    }
    this.data.push(`"${title}"`);
  }

  break(): void {
    this.data.push("");
  }

  save(name: string): void {
    const file = join(__dirname, "..", "..", "plot", `${name}.data`);
    const content = this.data.join("\n");
    writeFileSync(file, content, "utf-8");
  }
}
