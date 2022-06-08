import { dumpCircuit } from "@jssim/simulator/lib/circuit/debug.js";
import { parseNetlist } from "@jssim/simulator/lib/netlist/netlist.js";
import { dcAnalysis } from "@jssim/simulator/lib/simulation/dc.js";
import test from "ava";
import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import { fileURLToPath, URL } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

scan(join(__dirname, "..", "src", "dc"));

function scan(dir: string): void {
  for (const entry of readdirSync(dir)) {
    if (entry.endsWith(".md")) {
      const filename = join(dir, entry);
      const content = readFileSync(filename, "utf-8");
      const testCases = parse(entry, content);
      makeTest(entry, testCases);
    }
  }
}

function makeTest(filename: string, testCases: readonly TestCase[]): void {
  let index = 1;
  for (const { netlist, result } of testCases) {
    test(`${filename}#${index}`, (t) => {
      const circuit = parseNetlist(netlist);
      dcAnalysis(circuit);
      t.deepEqual(dumpCircuit(circuit), result);
    });
    index += 1;
  }
}

type TestCase = {
  netlist: string;
  result: string[];
};

function parse(filename: string, content: string): TestCase[] {
  const errorMessage = () => `Error parsing [${filename}]`;
  const cases: TestCase[] = [];
  const netlist: string[] = [];
  const result: string[] = [];
  let state = "initial";
  for (const line of content.split("\n")) {
    if (line === "") {
      continue;
    }
    switch (state) {
      case "initial":
        if (line.startsWith("---")) {
          continue;
        }
        if (line === "## Netlist") {
          state = "netlist";
          continue;
        }
        break;
      case "netlist":
        if (line === "```text") {
          state = "netlist-body";
          continue;
        }
        break;
      case "netlist-body":
        if (line === "```") {
          state = "netlist-end";
          continue;
        }
        netlist.push(line);
        continue;
      case "netlist-end":
        if (line === "## Result") {
          state = "result";
          continue;
        }
        break;
      case "result":
        if (line === "```text") {
          state = "result-body";
          continue;
        }
        break;
      case "result-body":
        if (line === "```") {
          state = "initial";
          makeTestCase();
          continue;
        }
        result.push(line);
        continue;
      default:
        throw new Error(errorMessage());
    }
  }
  if (state !== "initial") {
    throw new Error(errorMessage());
  }
  return cases;

  function makeTestCase(): void {
    cases.push({
      netlist: netlist.join("\n"),
      result: [...result],
    });
    netlist.splice(0);
    result.splice(0);
  }
}

function format(testCases: readonly TestCase[]): string {
  const lines: string[] = [];
  for (const { netlist, result } of testCases) {
    if (lines.length > 0) {
      lines.push("");
      lines.push("---");
      lines.push("");
    }
    lines.push("## Netlist");
    lines.push("");
    lines.push("```text");
    lines.push(netlist);
    lines.push("```");
    lines.push("");
    lines.push("## Result");
    lines.push("");
    lines.push("```text");
    lines.push(...result);
    lines.push("```");
  }
  return lines.join("\n");
}
