## Netlist

```json
[
  ["Ground", ["NN"], {}],
  ["I:DUT", ["NP", "NN"], { "i": -1 }],
  ["R:R1", ["NP", "NN"], { "r": 10 }]
]
```

## Result

```text
V(NP)=10V
DUT{Vd=10V,I=-1A}
R1{Vd=10V,I=1A,P=10W}
```
