## Netlist

```json
[
  ["Ground", ["g"], {}],
  ["V", ["NC", "g"], { "v": 5 }],
  ["V", ["NB", "g"], { "v": 0.65 }],
  ["Bjt:DUT", ["g", "NB", "NC"], {}]
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
V(NC)=5V
V(NB)=650mV
V1{Vd=5V,I=-812.346μA,P=-4.062mW}
V2{Vd=650mV,I=-8.123μA,P=-5.28μW}
DUT{Vbe=650mV,Vbc=-4.35V,Vce=5V,Ie=-820.469μA,Ic=812.346μA,Ib=8.123μA}
```

---

## Netlist

```json
[
  ["Ground", ["g"], {}],
  ["V", ["NC", "g"], { "v": 5 }],
  ["I", ["g", "NB"], { "i": 0.0001 }],
  ["Bjt:DUT", ["g", "NB", "NC"], {}]
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
V(NC)=5V
V(NB)=714.932mV
V1{Vd=5V,I=-10mA,P=-50mW}
I1{Vd=-714.932mV,I=100μA}
DUT{Vbe=714.932mV,Vbc=-4.285V,Vce=5V,Ie=-10.1mA,Ic=10mA,Ib=100μA}
```
