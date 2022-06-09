import { Netlist } from "@jssim/simulator/lib/netlist/netlist.js";
import { formatData, formatSchema } from "@jssim/simulator/lib/simulation/dataset.js";
import { program } from "commander";
import { readFileSync, writeFileSync } from "node:fs";
import { join, parse, resolve } from "node:path";

const run = (name: string, options: Record<string, unknown>): void => {
  const netlistPath = resolve(name);
  let content: string;
  try {
    content = readFileSync(netlistPath, "utf-8");
  } catch (err: any) {
    if (err.code === "ENOENT") {
      console.error(`File [${netlistPath}] not found.`);
    } else {
      console.error(`File [${netlistPath}] cannot be read: ${err.message}.`);
    }
    process.exit(1);
  }

  const netlist = Netlist.parse(content);

  netlist.runAnalyses((analysis, table) => {
    const { root, dir, name } = parse(netlistPath);
    const schemaPath = join(root, dir, `${name}.schema`);
    const dataPath = join(root, dir, `${name}.data`);
    try {
      writeFileSync(schemaPath, formatSchema(table));
    } catch (err: any) {
      console.error(`Cannot write file [${schemaPath}]: ${err.message}`);
    }
    try {
      writeFileSync(dataPath, formatData(table));
    } catch (err: any) {
      console.error(`Cannot write file [${dataPath}]: ${err.message}`);
    }
  });
};

program
  .name("jssim")
  .description("Electronic circuit simulator")
  .version("0.1")
  .argument("netlist", "netlist file")
  .action(run)
  .parse();
