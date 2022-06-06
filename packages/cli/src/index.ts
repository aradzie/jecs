import { program } from "commander";

const run = (netlist: string, options: Record<string, unknown>): void => {
  console.log({ netlist, options });
};

program
  .name("jssim")
  .description("Electronic circuit simulator")
  .version("0.1")
  .argument("netlist", "netlist file")
  .action(run)
  .parse();
