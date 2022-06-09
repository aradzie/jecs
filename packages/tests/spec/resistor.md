## Netlist

```text
V:V1 n1 gnd V=5
R:DUT n1 gnd R=1000
.dc
```

## Result

```text
V(n1)=5V
V1{V=5V,I=-5mA,P=-25mW}
DUT{V=5V,I=5mA,P=25mW}
```

---

## Netlist

```text
V:V1 n1 gnd V=5
R:DUT n1 gnd R=-1000
.dc
```

## Result

```text
V(n1)=5V
V1{V=5V,I=5mA,P=25mW}
DUT{V=5V,I=-5mA,P=-25mW}
```
