import { Schematic } from "../schematic/schematic.ts";
import { importElements } from "../schematic/serial.ts";

export function loadSchematic() {
  // prettier-ignore
  return Schematic.create(
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
      ["n", 250, 0, "lt", "h", "# Ohm's law\n\n*Ohm's law* states that the electric current $I$ through a conductor between two points is directly proportional to the voltage $V$ across the two points.\n\n$$I = \\frac{V}{R}$$\n\nThe law was named after the German physicist *Georg Ohm*."],
      ["n", 700, 0, "lm", "h", "\\[ \\int_{a}^{b} x^2 \\, dx \\]"],
      ["n", 700, 50, "lm", "h", "\\[ \\iint_V \\mu(u,v) \\, du \\, dv \\]"],
      ["n", 700, 100, "lm", "h", "\\[ \\oint_V f(s) \\, ds \\]"],
      ["n", 700, 150, "lm", "h", "\\[ \\sum_{n=1}^{\\infty} 2^{-n} = 1 \\]"],
      ["n", 700, 200, "lm", "h", "\\[ \\prod_{i=a}^{b} f(i) \\]"],
      ["n", 700, 250, "lm", "h", "\\[ \\lim_{x\\to\\infty} f(x) \\]"],
      ["n", 700, 300, "lm", "h", "\\[ \\begin{pmatrix} 1 & 2 & 3 \\\\ a & b & c \\end{pmatrix} \\]"],
    ]),
  );
}
