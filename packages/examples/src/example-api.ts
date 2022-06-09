import { Circuit } from "@jssim/simulator/lib/circuit/circuit.js";
import { dumpCircuit } from "@jssim/simulator/lib/circuit/debug.js";
import { Diode, Resistor, VSource } from "@jssim/simulator/lib/device/index.js";
import { DcAnalysis } from "@jssim/simulator/lib/simulation/analysis.js";

// Create an empty circuit.
const circuit = new Circuit();

// Allocate circuit nodes.
const GND = circuit.groundNode;
const N1 = circuit.makeNode("N1");
const N2 = circuit.makeNode("N2");

// Create devices.
const V1 = new VSource("V1", [N1, GND]);
const R1 = new Resistor("R1", [N1, N2]);
const D1 = new Diode("D1", [N2, GND]);

// Set device properties.
V1.properties.set("V", 10);
R1.properties.set("R", 1000);
D1.properties.set("Temp", 26.85);

// Add devices to the circuit.
circuit.addDevice(V1);
circuit.addDevice(R1);
circuit.addDevice(D1);

// Perform DC analysis, compute node voltages and branch currents.
new DcAnalysis().run(circuit);

// Print the operating points.
console.log(dumpCircuit(circuit));
