import test from "ava";
import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import { dumpCircuit } from "@jssim/simulator/lib/circuit/debug";
import type { Netlist } from "@jssim/simulator/lib/netlist/netlist";
import { readNetlist } from "@jssim/simulator/lib/netlist/netlist";
import { dcAnalysis } from "@jssim/simulator/lib/simulation/dc";
import type { Options } from "@jssim/simulator/lib/simulation/options";

scan(join(__dirname, "dc"));

function scan(dir: string): void {
  for (const entry of readdirSync(dir)) {
    if (entry.endsWith(".md")) {
      makeTest(entry, readFileSync(join(dir, entry), "utf-8"));
    }
  }
}

function makeTest(filename: string, content: string): void {
  let index = 1;
  for (const { netlist, options, result } of parse(filename, content)) {
    test(`${filename}#${index}`, (t) => {
      const circuit = readNetlist(netlist);
      dcAnalysis(circuit, options);
      t.deepEqual(dumpCircuit(circuit), result);
    });
    index += 1;
  }
}

type TestCase = {
  netlist: Netlist;
  options: Options;
  result: string[];
};

function parse(filename: string, content: string): TestCase[] {
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
        if (line === "```json") {
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
        throw new Error();
    }
  }
  if (state !== "initial") {
    throw new Error();
  }
  return cases;

  function makeTestCase(): void {
    cases.push({
      netlist: (toJson(netlist) as Netlist) ?? [],
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
