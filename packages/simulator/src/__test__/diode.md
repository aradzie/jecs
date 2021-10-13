## Netlist

```json
[
  ["Ground", ["g"], {}],
  ["V", ["NP", "g"], { "v": 5 }],
  ["Diode:DUT", ["g", "NP"], {}]
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
V(NP)=5V
V1{Vd=5V,I=0A,P=0W}
DUT{Vd=-5V,I=0A,P=0W}
```

---

## Netlist

```json
[
  ["Ground", ["g"], {}],
  ["I", ["g", "NP"], { "i": 0.1 }],
  ["Diode:DUT", ["NP", "g"], {}]
]
```

## Options

```json
{ "reltol": 1e-5 }
```

## Result

```text
V(NP)=773.844mV
I1{Vd=-773.844mV,I=100mA}
DUT{Vd=773.844mV,I=100mA,P=77.384mW}
```

---

## Netlist

```json
[
  ["Ground", ["g"], {}],
  ["I", ["g", "NP"], { "i": 1 }],
  ["Diode:DUT1", ["NP", "NM"], {}],
  ["Diode:DUT2", ["NM", "g"], {}]
]
```

## Options

```json
{ "reltol": 1e-5 }
```

## Result

```text
V(NP)=1.667V
V(NM)=833.37mV
I1{Vd=-1.667V,I=1A}
DUT1{Vd=833.37mV,I=1A,P=833.37mW}
DUT2{Vd=833.37mV,I=1A,P=833.37mW}
```

---

## Netlist

```json
[
  ["Ground", ["g"], {}],
  ["V", ["NP", "g"], { "v": 0.8 }],
  ["Diode:DUT", ["NP", "g"], {}]
]
```

## Options

```json
{ "reltol": 1e-5 }
```

## Result

```text
V(NP)=800mV
V1{Vd=800mV,I=-275.048mA,P=-220.038mW}
DUT{Vd=800mV,I=275.048mA,P=220.038mW}
```

---

## Netlist

```json
[
  ["Ground", ["g"], {}],
  ["V", ["NP", "g"], { "v": 1.6 }],
  ["Diode:DUT1", ["NP", "NM"], {}],
  ["Diode:DUT2", ["NM", "g"], {}]
]
```

## Options

```json
{ "reltol": 1e-5 }
```

## Result

```text
V(NP)=1.6V
V(NM)=800mV
V1{Vd=1.6V,I=-275.048mA,P=-440.077mW}
DUT1{Vd=800mV,I=275.048mA,P=220.038mW}
DUT2{Vd=800mV,I=275.048mA,P=220.038mW}
```
