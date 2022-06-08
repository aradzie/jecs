## Netlist

```text
V n1 gnd V=5
C:DUT n1 gnd C=1e-3
.dc
```

## Result

```text
V(n1)=5V
V1{V=5V,I=0A,P=0W}
DUT{V=5V,I=0A,P=0W}
```
