## Netlist

```text
V np g V=5;
R:DUT np g R=1000;
```

## Result

```text
V(np)=5V
V1{V=5V,I=-5mA,P=-25mW}
DUT{V=5V,I=5mA,P=25mW}
```

---

## Netlist

```text
V np g V=5;
R:DUT np g R=-1000;
```

## Result

```text
V(np)=5V
V1{V=5V,I=5mA,P=25mW}
DUT{V=5V,I=-5mA,P=-25mW}
```
