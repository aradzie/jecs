## Netlist

```text
Ground ncn;
Ground non;
I ncp ncn I=-1;
CCVS:DUT nop non ncp ncn gain=10;
R nop non R=10;
```

## Result

```text
V(ncp)=0V
V(nop)=10V
I1{Vd=0V,I=-1A}
DUT{Vd=10V,I=-1A,P=-10W}
R1{Vd=10V,I=1A,P=10W}
```
