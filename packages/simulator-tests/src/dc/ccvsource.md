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
I1{I=-1A,V=0V,P=0W}
DUT{V=10V,I=-1A,P=-10W}
R1{V=10V,I=1A,P=10W}
```
