## Netlist

```text
Ground g;
V np g V=5;
Diode:DUT g np;
```

## Options

```json
{ "reltol": 0.00001 }
```

## Result

```text
V(np)=5V
V1{Vd=5V,I=0A,P=0W}
DUT{Vd=-5V,I=0A,P=0W}
```

---

## Netlist

```text
Ground g;
I g np I=0.1;
Diode:DUT np g;
```

## Options

```json
{ "reltol": 0.00001 }
```

## Result

```text
V(np)=773.844mV
I1{Vd=-773.844mV,I=100mA}
DUT{Vd=773.844mV,I=100mA,P=77.384mW}
```

---

## Netlist

```text
Ground g;
I g np I=1;
Diode:DUT1 np nm;
Diode:DUT2 nm g;
```

## Options

```json
{ "reltol": 0.00001 }
```

## Result

```text
V(np)=1.667V
V(nm)=833.37mV
I1{Vd=-1.667V,I=1A}
DUT1{Vd=833.37mV,I=1A,P=833.37mW}
DUT2{Vd=833.37mV,I=1A,P=833.37mW}
```

---

## Netlist

```text
Ground g;
V np g V=0.8;
Diode:DUT np g;
```

## Options

```json
{ "reltol": 0.00001 }
```

## Result

```text
V(np)=800mV
V1{Vd=800mV,I=-275.048mA,P=-220.038mW}
DUT{Vd=800mV,I=275.048mA,P=220.038mW}
```

---

## Netlist

```text
Ground g;
V np g V=1.6;
Diode:DUT1 np nm;
Diode:DUT2 nm g;
```

## Options

```json
{ "reltol": 0.00001 }
```

## Result

```text
V(np)=1.6V
V(nm)=800mV
V1{Vd=1.6V,I=-275.048mA,P=-440.077mW}
DUT1{Vd=800mV,I=275.048mA,P=220.038mW}
DUT2{Vd=800mV,I=275.048mA,P=220.038mW}
```
