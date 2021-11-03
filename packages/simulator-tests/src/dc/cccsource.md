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
I1{I=1A,V=0V,P=0W}
DUT{I=-2A,V=10V,P=-20W}
R1{V=10V,I=2A,P=20W}
```
