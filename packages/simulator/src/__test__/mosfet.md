## Netlist

```json
[
  ["Ground", ["g"], {}],
  ["V", ["ND", "g"], { "v": 15 }],
  ["V", ["NG", "g"], { "v": 10 }],
  ["MOSFET:DUT", ["ND", "NG","g"], { "polarity": "nfet" }]
]
```

## Options

```json
{
  "reltol": 1e-5
}
```

## Result

```text
V(ND)=15V
V(NG)=10V
V1{Vd=15V,I=-640mA,P=-9.6W}
V2{Vd=10V,I=0A,P=0W}
DUT{Vds=15V,Vgs=10V,Ids=640mA}
```
