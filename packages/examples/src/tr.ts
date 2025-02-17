import { Capacitor, Resistor, Vac } from "@jecs/devices";
import { Circuit, dumpCircuit, logger, TrAnalysis } from "@jecs/simulator";

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
V1.props.set("V", 1);
V1.props.set("f", 1e3);

C1.props.set("C", 1e-6);
R1.props.set("R", 1e1);

// Connect devices in the circuit.
circuit.connect(V1, [N1, GND]);
circuit.connect(C1, [N1, N2]);
circuit.connect(R1, [N2, GND]);

// Perform DC analysis, compute node voltages and branch currents.
const analysis = new TrAnalysis();
analysis.props.set("stopTime", 1e-3);
analysis.props.set("timeStep", 1e-4);
analysis.props.set("maxIter", 10);
analysis.props.set("abstol", 1e-12);
analysis.props.set("vntol", 1e-6);
analysis.props.set("reltol", 1e-3);
analysis.run(circuit);

// Print the operating points.
console.log(dumpCircuit(circuit));

console.log(String(logger));
