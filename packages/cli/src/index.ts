import { formatData, formatSchema, Table } from "@jssim/simulator/lib/analysis/dataset.js";
import { Netlist } from "@jssim/simulator/lib/netlist/netlist.js";
import { logger } from "@jssim/simulator/lib/util/logging.js";
import { program } from "commander";
import * as console from "console";
import { readFileSync, writeFileSync } from "node:fs";
import { join, parse, resolve } from "node:path";

const run = (name: string, { verbose = false }: { verbose?: boolean }): void => {
  const netlistPath = resolve(name);
  let content: string;
  try {
    content = readFileSync(netlistPath, "utf-8");
  } catch (err: any) {
    if (err.code === "ENOENT") {
      console.error(`File [${netlistPath}] not found.`);
    } else {
      console.error(`File [${netlistPath}] cannot be read: ${err}.`);
    }
    process.exit(1);
  }

  const { circuit, analyses } = Netlist.parse(content);

  for (const analysis of analyses) {
    let table: Table;
    try {
      table = analysis.run(circuit);
    } catch (err: any) {
      console.error(`Error processing netlist [${netlistPath}]: ${err}`);
      process.exit(1);
    }

    const { root, dir, name } = parse(netlistPath);
    const schemaPath = join(root, dir, `${name}.schema`);
    const dataPath = join(root, dir, `${name}.data`);

    try {
      writeFileSync(schemaPath, formatSchema(table));
    } catch (err: any) {
      console.error(`Cannot write file [${schemaPath}]: ${err}`);
      process.exit(1);
    }

    try {
      writeFileSync(dataPath, formatData(table));
    } catch (err: any) {
      console.error(`Cannot write file [${dataPath}]: ${err}`);
      process.exit(1);
    }

    if (verbose) {
      console.log(String(logger));
    }
  }
};

program
  .name("jssim")
  .description("Electronic circuit simulator")
  .version("0.1")
  .option("--verbose", "verbose output")
  .argument("netlist", "netlist file")
  .action(run)
  .parse();
