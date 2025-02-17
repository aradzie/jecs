import { Diode, Resistor, Vdc } from "@jecs/devices";
import { Circuit, DcAnalysis, dumpCircuit, logger } from "@jecs/simulator";

// Create an empty circuit.
const circuit = new Circuit();

// Allocate circuit nodes.
const GND = circuit.groundNode;
const N1 = circuit.makeNode("N1");
const N2 = circuit.makeNode("N2");

// Create devices.
const V1 = new Vdc("V1");
const R1 = new Resistor("R1");
const D1 = new Diode("D1");

// Connect devices in the circuit.
circuit.connect(V1, [N1, GND]);
circuit.connect(R1, [N1, N2]);
circuit.connect(D1, [N2, GND]);

// Set device properties.
V1.props.set("V", 10);
R1.props.set("R", 1000);
D1.props.set("temp", 26.85);

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
