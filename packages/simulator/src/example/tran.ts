import { Circuit } from "../circuit/circuit.js";
import { Capacitor, Resistor, VSource } from "../device/index.js";
import { tranAnalysis } from "../simulation/tran.js";

// Create an empty circuit.
const circuit = new Circuit();

// Allocate circuit nodes.
const ng = circuit.groundNode;
const n1 = circuit.makeNode("N1");
const n2 = circuit.makeNode("N2");

// Add devices to the circuit.
circuit.addDevice(
  new VSource("V1", [n1, ng], {
    V: 10,
  }),
  new Resistor("R1", [n1, n2], {
    R: 1e2,
  }),
  new Capacitor("C1", [n2, ng], {
    C: 1e-4,
  }),
);

// Perform transient analysis, compute node voltages and branch currents at every time point.
const ops = tranAnalysis(circuit, {
  timeInterval: 1e-1,
  timeStep: 1e-3,
});

// Print the operating points/output parameters.
console.log(ops);
