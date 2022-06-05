## Netlist

```text
V n1 g V=5;
R:DUT n1 g R=1000;
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
V n1 g V=5;
R:DUT n1 g R=-1000;
```

## Result

```text
V(n1)=5V
V1{V=5V,I=5mA,P=25mW}
DUT{V=5V,I=-5mA,P=-25mW}
```
