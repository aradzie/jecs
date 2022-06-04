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
    V: { type: "sin", offset: 0, amplitude: 1, frequency: 100, phase: 0 },
  }),
  new Resistor("R1", [n1, n2], {
    R: 100,
  }),
  new Capacitor("C1", [n2, ng], {
    C: 0.0001,
  }),
);

// Perform transient analysis, compute node voltages and branch currents at every time point.
const ops = tranAnalysis(circuit, {
  timeInterval: 0.1,
  timeStep: 0.001,
});

// Print the operating points/output parameters.
console.log(ops);
