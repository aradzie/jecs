import { DcAnalysis } from "@jecs/simulator/lib/analysis/analysis-dc.js";
import { Circuit } from "@jecs/simulator/lib/circuit/circuit.js";
import { dumpCircuit } from "@jecs/simulator/lib/circuit/debug.js";
import { Diode, Vdc } from "@jecs/simulator/lib/device/index.js";
import { logger } from "@jecs/simulator/lib/util/logging.js";

// Create an empty circuit.
const circuit = new Circuit();

// Allocate circuit nodes.
const GND = circuit.groundNode;
const N1 = circuit.makeNode("N1");
const N2 = circuit.makeNode("N2");
const N3 = circuit.makeNode("N3");

// Create devices.
const V1 = new Vdc("V1");
const D1 = new Diode("D1");
const D2 = new Diode("D2");
const D3 = new Diode("D3");

// Set device properties.
V1.props.set("V", 0.7 * 3);

// Connect devices in the circuit.
circuit.connect(V1, [N1, GND]);
circuit.connect(D1, [N1, N2]);
circuit.connect(D2, [N2, N3]);
circuit.connect(D3, [N3, GND]);

// Perform DC analysis, compute node voltages and branch currents.
const analysis = new DcAnalysis();
analysis.props.set("maxIter", 10);
analysis.props.set("abstol", 1e-12);
analysis.props.set("vntol", 1e-6);
analysis.props.set("reltol", 1e-3);
analysis.run(circuit);

// Print the operating points.
console.log(dumpCircuit(circuit));

console.log(String(logger));
