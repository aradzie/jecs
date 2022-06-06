import { program } from "commander";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { simulate } from "./simulate.js";

const run = (netlist: string, options: Record<string, unknown>): void => {
  const path = resolve(netlist);
  let content: string;
  try {
    content = readFileSync(path, "utf-8");
  } catch (err: any) {
    if (err.code === "ENOENT") {
      console.error(`File [${path}] not found.`);
    } else {
      console.error(`File [${path}] cannot be read: ${err.message}.`);
    }
    process.exitCode = 1;
    return;
  }
  simulate(content);
};

program
  .name("jssim")
  .description("Electronic circuit simulator")
  .version("0.1")
  .argument("netlist", "netlist file")
  .action(run)
  .parse();
