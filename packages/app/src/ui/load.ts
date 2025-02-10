import { Schematic } from "../schematic/schematic.ts";
import { importElements } from "../schematic/serial.ts";

export function loadSchematic() {
  return new Schematic(
    importElements([
      ["i", 50, 50, 0, "vdc", "V1", {}],
      ["i", 150, 50, 0, "r", "R1", {}],
      ["i", 50, 120, 0, "g", "G1", {}],
      ["w", 50, 0, 150, 0],
      ["w", 50, 100, 150, 100],
      ["w", 50, 0, 50, 20],
      ["w", 50, 80, 50, 100],
      ["w", 50, 100, 50, 120],
      ["w", 150, 0, 150, 20],
      ["w", 150, 80, 150, 100],
      [
        "n",
        300,
        0,
        "lt",
        "# Ohm's law\n\n" +
          "$$I = \\frac{V}{R}$$\n\n" +
          "*Ohm's law* states that the electric current\n" +
          "through a conductor between two points\n" +
          "is directly proportional to the voltage\n" +
          "across the two points.",
      ],
    ]),
  );
}
