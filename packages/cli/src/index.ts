import { Analysis, Circuit, formatData, formatSchema, logger, Netlist } from "@jecs/simulator";
import { program } from "commander";
import { readFileSync, writeFileSync } from "node:fs";
import { join, parse, resolve } from "node:path";

const runAnalysis = (
  circuit: Circuit,
  analysis: Analysis,
  netlistPath: string,
  verbose: boolean,
): void => {
  const dataset = analysis.run(circuit);

  const { root, dir, name } = parse(netlistPath);
  const schemaPath = join(root, dir, `${name}.schema`);
  const dataPath = join(root, dir, `${name}.data`);

  try {
    writeFileSync(schemaPath, formatSchema(dataset));
  } catch (err: any) {
    throw new Error(`Cannot write file [${schemaPath}].`, { cause: err });
  }

  try {
    writeFileSync(dataPath, formatData(dataset));
  } catch (err: any) {
    throw new Error(`Cannot write file [${dataPath}].`, { cause: err });
  }

  if (verbose) {
    console.log(String(logger));
  }
};

const run0 = (netlistPath: string, { verbose = false }: { verbose?: boolean }): void => {
  let content: string;
  try {
    content = readFileSync(netlistPath, "utf-8");
  } catch (err: any) {
    if (err.code === "ENOENT") {
      throw new Error(`File [${netlistPath}] not found.`);
    } else {
      throw new Error(`File [${netlistPath}] cannot be read.`, { cause: err });
    }
  }

  const { circuit, analyses } = Netlist.parse({ content, location: netlistPath });

  for (const analysis of analyses) {
    runAnalysis(circuit, analysis, netlistPath, verbose);
  }
};

const run = (name: string, { verbose = false }: { verbose?: boolean }): void => {
  const netlistPath = resolve(name);
  try {
    run0(netlistPath, { verbose });
  } catch (err: any) {
    // Print error.
    console.error(`${err.name}: ${err.message}`);

    // Print cause.
    let { cause } = err;
    while (cause) {
      console.error(`  ${cause.name}: ${cause.message}`);
      cause = cause.cause;
    }

    // Print location.
    const { location } = err;
    if (location) {
      const {
        source,
        start: { line, column },
      } = location;
      console.error(`  at ${source}:${line}:${column}`);
    } else {
      console.error(`  at ${netlistPath}`);
    }

    // Terminate.
    process.exit(1);
  }
};

program
  .name("jecs")
  .description("Electronic circuit simulator")
  .version("0.1")
  .option("--verbose", "verbose output")
  .argument("netlist", "netlist file")
  .action(run)
  .parse();
