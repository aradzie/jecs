import { TrAnalysis } from "@jecs/simulator/lib/analysis/analysis.js";
import { Circuit } from "@jecs/simulator/lib/circuit/circuit.js";
import { dumpCircuit } from "@jecs/simulator/lib/circuit/debug.js";
import { Capacitor, Resistor, Vac } from "@jecs/simulator/lib/device/index.js";
import { logger } from "@jecs/simulator/lib/util/logging.js";

// Create an empty circuit.
const circuit = new Circuit();

// Allocate circuit nodes.
const GND = circuit.groundNode;
const N1 = circuit.makeNode("N1");
const N2 = circuit.makeNode("N2");

// Create devices.
const V1 = new Vac("V1");
const C1 = new Capacitor("C1");
const R1 = new Resistor("R1");

// Set device properties.
V1.properties.set("V", 1);
V1.properties.set("f", 1e3);

C1.properties.set("C", 1e-6);
R1.properties.set("R", 1e1);

// Connect devices in the circuit.
circuit.connect(V1, [N1, GND]);
circuit.connect(C1, [N1, N2]);
circuit.connect(R1, [N2, GND]);

// Perform DC analysis, compute node voltages and branch currents.
const analysis = new TrAnalysis();
analysis.properties.set("dc", "no");
analysis.properties.set("stopTime", 1e-3);
analysis.properties.set("timeStep", 1e-4);
analysis.properties.set("maxIter", 10);
analysis.properties.set("abstol", 1e-12);
analysis.properties.set("vntol", 1e-6);
analysis.properties.set("reltol", 1e-3);
analysis.run(circuit);

// Print the operating points.
console.log(dumpCircuit(circuit));

console.log(String(logger));
