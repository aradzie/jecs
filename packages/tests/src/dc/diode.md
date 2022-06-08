## Netlist

```text
Ground g;
V np g V=5;
Diode:DUT g np;
.options reltol=1e-5;
```

## Result

```text
V(np)=5V
V1{V=5V,I=0A,P=0W}
DUT{V=-5V,I=0A,P=0W}
```

---

## Netlist

```text
Ground g;
I g np I=0.1;
Diode:DUT np g;
.options reltol=1e-5;
```

## Result

```text
V(np)=773.844mV
I1{I=100mA,V=-773.844mV,P=-77.384mW}
DUT{V=773.844mV,I=100mA,P=77.384mW}
```

---

## Netlist

```text
Ground g;
I g np I=1;
Diode:DUT1 np nm;
Diode:DUT2 nm g;
.options reltol=1e-5;
```

## Result

```text
V(np)=1.667V
V(nm)=833.37mV
I1{I=1A,V=-1.667V,P=-1.667W}
DUT1{V=833.37mV,I=1A,P=833.37mW}
DUT2{V=833.37mV,I=1A,P=833.37mW}
```

---

## Netlist

```text
Ground g;
V np g V=0.8;
Diode:DUT np g;
.options reltol=1e-5;
```

## Result

```text
V(np)=800mV
V1{V=800mV,I=-275.048mA,P=-220.038mW}
DUT{V=800mV,I=275.048mA,P=220.038mW}
```

---

## Netlist

```text
Ground g;
V np g V=1.6;
Diode:DUT1 np nm;
Diode:DUT2 nm g;
.options reltol=1e-5;
```

## Result

```text
V(np)=1.6V
V(nm)=800mV
V1{V=1.6V,I=-275.048mA,P=-440.077mW}
DUT1{V=800mV,I=275.048mA,P=220.038mW}
DUT2{V=800mV,I=275.048mA,P=220.038mW}
```
