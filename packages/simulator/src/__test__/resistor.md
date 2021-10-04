## Netlist

```json
[
  ["v", ["NP", "g"], { "v": 5 }],
  ["r:DUT", ["NP", "g"], { "r": 1000 }]
]
```

## Result

```text
V(NP)=5V
V1{Vd=5V,I=-5mA,P=-25mW}
DUT{Vd=5V,I=5mA,P=25mW}
```
