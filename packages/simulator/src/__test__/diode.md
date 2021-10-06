## Netlist

```json
[
  ["g", ["g"], {}],
  ["v", ["NP", "g"], { "v": 5 }],
  ["d:DUT", ["g", "NP"], {}]
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
  ["g", ["g"], {}],
  ["i", ["g", "NP"], { "i": 0.1 }],
  ["d:DUT", ["NP", "g"], {}]
]
```

## Options

```json
{ "reltol": 1e-5 }
```

## Result

```text
V(NP)=774.231mV
I1{Vd=-774.231mV,I=100mA}
DUT{Vd=774.231mV,I=100mA,P=77.423mW}
```

---

## Netlist

```json
[
  ["g", ["g"], {}],
  ["i", ["g", "NP"], { "i": 1 }],
  ["d:DUT1", ["NP", "NM"], {}],
  ["d:DUT2", ["NM", "g"], {}]
]
```

## Options

```json
{ "reltol": 1e-5 }
```

## Result

```text
V(NP)=1.668V
V(NM)=833.787mV
I1{Vd=-1.668V,I=1A}
DUT1{Vd=833.787mV,I=1A,P=833.787mW}
DUT2{Vd=833.787mV,I=1A,P=833.787mW}
```

---

## Netlist

```json
[
  ["g", ["g"], {}],
  ["v", ["NP", "g"], { "v": 0.8 }],
  ["d:DUT", ["NP", "g"], {}]
]
```

## Options

```json
{ "reltol": 1e-5 }
```

## Result

```text
V(NP)=800mV
V1{Vd=800mV,I=-270.827mA,P=-216.662mW}
DUT{Vd=800mV,I=270.827mA,P=216.662mW}
```

---

## Netlist

```json
[
  ["g", ["g"], {}],
  ["v", ["NP", "g"], { "v": 1.6 }],
  ["d:DUT1", ["NP", "NM"], {}],
  ["d:DUT2", ["NM", "g"], {}]
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
V1{Vd=1.6V,I=-270.827mA,P=-433.323mW}
DUT1{Vd=800mV,I=270.827mA,P=216.662mW}
DUT2{Vd=800mV,I=270.827mA,P=216.662mW}
```
