## Netlist

```text
Ground [NCN];
Ground [NON];
V [NCP NCN] v=1;
VCCS:DUT [NOP NON NCP NCN] gain=2;
R [NOP NON] r=10;
```

## Result

```text
V(NCP)=1V
V(NOP)=-20V
V1{Vd=1V,I=0A,P=0W}
DUT{Vd=-20V,I=2A}
R1{Vd=-20V,I=-2A,P=40W}
```
