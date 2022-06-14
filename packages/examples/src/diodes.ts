import { DcAnalysis } from "@jssim/simulator/lib/analysis/analysis.js";
import { Circuit } from "@jssim/simulator/lib/circuit/circuit.js";
import { dumpCircuit } from "@jssim/simulator/lib/circuit/debug.js";
import { Diode, VSource } from "@jssim/simulator/lib/device/index.js";
import { logger } from "@jssim/simulator/lib/util/logging.js";

// Create an empty circuit.
const circuit = new Circuit();

// Allocate circuit nodes.
const GND = circuit.groundNode;
const N1 = circuit.makeNode("N1");
const N2 = circuit.makeNode("N2");
const N3 = circuit.makeNode("N3");

// Create devices.
const V1 = new VSource("V1", [N1, GND]);
const D1 = new Diode("D1", [N1, N2]);
const D2 = new Diode("D2", [N2, N3]);
const D3 = new Diode("D3", [N3, GND]);

// Set device properties.
V1.properties.set("V", 0.7 * 3);

// Add devices to the circuit.
circuit.addDevice(V1);
circuit.addDevice(D1);
circuit.addDevice(D2);
circuit.addDevice(D3);

// Perform DC analysis, compute node voltages and branch currents.
new DcAnalysis().run(circuit);

// Print the operating points.
console.log(dumpCircuit(circuit));

console.log(String(logger));
