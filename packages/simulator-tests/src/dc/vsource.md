## Netlist

```json
[
  ["Ground", ["NN"], {}],
  ["V:DUT", ["NP", "NN"], { "v": 5 }],
  ["R", ["NP", "NN"], { "r": 1000 }]
]
```

## Result

```text
V(NP)=5V
DUT{Vd=5V,I=-5mA,P=-25mW}
R1{Vd=5V,I=5mA,P=25mW}
```
