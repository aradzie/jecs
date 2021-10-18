import { dumpCircuit } from "@jssim/simulator/lib/circuit/debug";
import { parseNetlist } from "@jssim/simulator/lib/netlist/netlist";
import { dcAnalysis } from "@jssim/simulator/lib/simulation/dc";
import type { Options } from "@jssim/simulator/lib/simulation/options";
import test from "ava";
import { readdirSync, readFileSync } from "fs";
import { join } from "path";

scan(join(__dirname, "dc"));

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
  for (const { netlist, options, result } of testCases) {
    test(`${filename}#${index}`, (t) => {
      const circuit = parseNetlist(netlist);
      dcAnalysis(circuit, options);
      t.deepEqual(dumpCircuit(circuit), result);
    });
    index += 1;
  }
}

type TestCase = {
  netlist: string;
  options: Options;
  result: string[];
};

function parse(filename: string, content: string): TestCase[] {
  const errorMessage = () => `Error parsing [${filename}]`;
  const cases: TestCase[] = [];
  const netlist: string[] = [];
  const options: string[] = [];
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
        if (line === "## Options") {
          state = "options";
          continue;
        }
        if (line === "## Result") {
          state = "result";
          continue;
        }
        break;
      case "options":
        if (line === "```json") {
          state = "options-body";
          continue;
        }
        break;
      case "options-body":
        if (line === "```") {
          state = "options-end";
          continue;
        }
        options.push(line);
        continue;
      case "options-end":
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
      options: (toJson(options) as Options) ?? {},
      result: [...result],
    });
    netlist.splice(0);
    options.splice(0);
    result.splice(0);
  }

  function toJson(lines: string[]): unknown {
    if (lines.length === 0) {
      return null;
    } else {
      try {
        return JSON.parse(lines.join("\n"));
      } catch (err: any) {
        throw new SyntaxError(`Error parsing file ${filename}: ${err}`);
      }
    }
  }
}

function format(testCases: readonly TestCase[]): string {
  const lines: string[] = [];
  for (const testCase of testCases) {
    if (lines.length > 0) {
      lines.push("");
      lines.push("---");
      lines.push("");
    }
    lines.push("## Netlist");
    lines.push("");
    lines.push("```text");
    lines.push(testCase.netlist);
    lines.push("```");
    lines.push("");
    if (Object.keys(testCase.options).length > 0) {
      lines.push("## Options");
      lines.push("");
      lines.push("```json");
      lines.push(JSON.stringify(testCase.options));
      lines.push("```");
      lines.push("");
    }
    lines.push("## Result");
    lines.push("");
    lines.push("```text");
    lines.push(...testCase.result);
    lines.push("```");
  }
  return lines.join("\n");
}
