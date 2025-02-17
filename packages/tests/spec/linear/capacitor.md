## Netlist

```text
V:V1 n1 gnd V=5
C:DUT n1 gnd C=1e-3
.dc
```

## Result

```text
V(n1)=5V
V1{V=5V,I=0A}
DUT{V=5V,I=0A}
```
