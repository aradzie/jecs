# Electronic Circuit Simulator

**jecs** is an electronic circuit simulator written in TypeScript.

It supports AC, DC and transient analyses.

## Example

Create a netlist file `netlist.txt`:

```text
Vac:Vin pow gnd V=1 f=1k
R:R1 pow vout R=1k
C:C1 vout gnd C=$C1
R:R2 vout gnd R=1k
.tr
  stopTime=3m timeStep=1u
  .sweep $C1 type="lin" start=1u stop=3u points=3
```

and run the simulator in the terminal:

```shell
jecs --verbose netlist.txt
```

The simulator will produce a dataset file `netlist.data`.

## Example

The following code:

```typescript
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
```

prints the following result:

```typescript
[
  "V(N1)=10V", // voltage at node N1
  "V(N2)=712.407mV", // voltage at node N2
  "V1{V=10V,I=-9.288mA,P=-92.876mW}", // voltage source output params
  "R1{V=9.288V,I=9.288mA,P=86.259mW}", // resistor output params
  "D1{V=712.407mV,I=9.288mA,P=6.617mW}", // diode output params
];
```

## Virtual Curve Tracer

The following non-linear device I/V curves were obtained from the simulator.

### Diode I/V Curve

![Diode I/V curve](examples/iv-diode.svg)

### BJT I/V Curve

![BJT I/V curve](examples/iv-bjt.svg)

### MOSFET I/V Curve

![MOSFET I/V curve](examples/iv-mosfet.svg)

### JFET I/V Curve

![JFET I/V curve](examples/iv-jfet.svg)

### BJT Amplifier I/V Curve

![BJT Amplifier I/V curve](examples/amp-bjt.svg)

### MOSFET Amplifier I/V Curve

![MOSFET Amplifier I/V curve](examples/amp-mosfet.svg)
