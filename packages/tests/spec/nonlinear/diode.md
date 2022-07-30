## Netlist

```text
V:V1 np gnd V=5
Diode:DUT gnd np
.dc
```

## Result

```text
V(np)=5V
V1{V=5V,I=0A}
DUT{V=-5V,I=0A}
```

---

## Netlist

```text
I:I1 gnd np I=0.1
Diode:DUT np gnd
.dc
```

## Result

```text
V(np)=773.844mV
I1{I=100mA,V=-773.844mV}
DUT{V=773.844mV,I=100mA}
```

---

## Netlist

```text
I:I1 gnd np I=1
Diode:DUT1 np nm
Diode:DUT2 nm gnd
.dc
```

## Result

```text
V(np)=1.667V
V(nm)=833.37mV
I1{I=1A,V=-1.667V}
DUT1{V=833.37mV,I=1000mA}
DUT2{V=833.37mV,I=1000mA}
```

---

## Netlist

```text
V:V1 np gnd V=0.8
Diode:DUT np gnd
.dc
```

## Result

```text
V(np)=800mV
V1{V=800mV,I=-275.048mA}
DUT{V=800mV,I=275.048mA}
```

---

## Netlist

```text
V:V1 np gnd V=1.6
Diode:DUT1 np nm
Diode:DUT2 nm gnd
.dc
```

## Result

```text
V(np)=1.6V
V(nm)=800mV
V1{V=1.6V,I=-275.048mA}
DUT1{V=800mV,I=275.048mA}
DUT2{V=800mV,I=275.048mA}
```
