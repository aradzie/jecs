import { Circuit } from "./circuit/circuit";
import { dumpCircuit } from "./circuit/debug";
import { Diode, Resistor, VSource } from "./device";
import { dcAnalysis } from "./simulation/dc";

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
    R: 1000,
  }),
  new Diode("D1", [n2, ng], {
    Temp: 26.85,
    Is: 1e-14,
    N: 1,
  }),
);

// Perform DC analysis, compute node voltages and branch currents.
dcAnalysis(circuit);

// Print the operating points.
console.log(dumpCircuit(circuit));
