## Netlist

```text
Ground ncn;
Ground non;
V ncp ncn V=1;
VCCS:DUT nop non ncp ncn gain=2;
R nop non R=10;
```

## Result

```text
V(ncp)=1V
V(nop)=-20V
V1{Vd=1V,I=0A,P=0W}
DUT{Vd=-20V,I=2A}
R1{Vd=-20V,I=-2A,P=40W}
```
