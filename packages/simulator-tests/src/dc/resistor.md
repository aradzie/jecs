## Netlist

```text
V np g v=5;
R:DUT np g r=1000;
```

## Result

```text
V(np)=5V
V1{Vd=5V,I=-5mA,P=-25mW}
DUT{Vd=5V,I=5mA,P=25mW}
```

---

## Netlist

```text
V np g v=5;
R:DUT np g r=-1000;
```

## Result

```text
V(np)=5V
V1{Vd=5V,I=5mA,P=25mW}
DUT{Vd=5V,I=-5mA,P=-25mW}
```
