## Netlist

```text
I:DUT np gnd I=-1
R:R1 np gnd R=10
.dc
```

## Result

```text
V(np)=10V
DUT{I=-1A,V=10V}
R1{V=10V,I=1A}
```
