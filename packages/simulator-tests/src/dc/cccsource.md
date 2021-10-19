## Netlist

```text
Ground ncn;
Ground non;
I ncp ncn I=1;
CCCS:DUT nop non ncp ncn gain=2;
R nop non R=5;
```

## Result

```text
V(ncp)=0V
V(nop)=10V
I1{Vd=0V,I=1A}
DUT{Vd=10V,I=-2A}
R1{Vd=10V,I=2A,P=20W}
```
