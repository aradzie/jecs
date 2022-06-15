## Netlist

```text
V:V1 np gnd V=5
Diode:DUT gnd np
.dc
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
I:I1 gnd np I=0.1
Diode:DUT np gnd
.dc
```

## Result

```text
V(np)=773.844mV
I1{I=100mA,V=-773.844mV,P=-77.384mW}
DUT{V=773.844mV,I=100.002mA,P=77.386mW}
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
I1{I=1A,V=-1.667V,P=-1.667W}
DUT1{V=833.37mV,I=1A,P=833.374mW}
DUT2{V=833.37mV,I=1A,P=833.374mW}
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
V1{V=800mV,I=-275.048mA,P=-220.038mW}
DUT{V=800mV,I=275.048mA,P=220.038mW}
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
V1{V=1.6V,I=-275.048mA,P=-440.077mW}
DUT1{V=800mV,I=275.048mA,P=220.038mW}
DUT2{V=800mV,I=275.048mA,P=220.038mW}
```
