import { DcAnalysis } from "@jssim/simulator/lib/analysis/analysis.js";
import { Circuit } from "@jssim/simulator/lib/circuit/circuit.js";
import { dumpCircuit } from "@jssim/simulator/lib/circuit/debug.js";
import { Diode, Resistor, Vdc } from "@jssim/simulator/lib/device/index.js";
import { logger } from "@jssim/simulator/lib/util/logging.js";

// Create an empty circuit.
const circuit = new Circuit();

// Allocate circuit nodes.
const GND = circuit.groundNode;
const N1 = circuit.makeNode("N1");
const N2 = circuit.makeNode("N2");

// Create devices.
const V1 = new Vdc("V1", [N1, GND]);
const R1 = new Resistor("R1", [N1, N2]);
const D1 = new Diode("D1", [N2, GND]);

// Add devices to the circuit.
circuit.addDevice(V1);
circuit.addDevice(R1);
circuit.addDevice(D1);

// Set device properties.
V1.properties.set("V", 10);
R1.properties.set("R", 1000);
D1.properties.set("temp", 26.85);

// Perform DC analysis, compute node voltages and branch currents.
const analysis = new DcAnalysis();
analysis.properties.set("maxIter", 10);
analysis.properties.set("abstol", 1e-12);
analysis.properties.set("vntol", 1e-6);
analysis.properties.set("reltol", 1e-3);
analysis.run(circuit);

// Print the operating points.
console.log(dumpCircuit(circuit));

console.log(String(logger));
