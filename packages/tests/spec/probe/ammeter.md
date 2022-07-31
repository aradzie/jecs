## Netlist

```text
V:V1 n1 gnd V=5
Ammeter:DUT n1 n2
R:R1 n2 gnd R=1000
.dc
```

## Result

```text
V(n1)=5V
V(n2)=5V
V1{V=5V,I=-5mA}
DUT{I=5mA,Imax=NaN,Imin=NaN,Irms=NaN}
R1{V=5V,I=5mA}
```

---

## Netlist

```text
Vac:Vac1 n1 gnd V=5 f=1k
Ammeter:DUT n1 n2
R:R1 n2 gnd R=1000
.tran stopTime=3m timeStep=1u
```

## Result

```text
V(n1)=-0.004pV
V(n2)=-0.004pV
Vac1{V=-0.004pV,I=0A}
DUT{I=0A,Imax=5mA,Imin=-5mA,Irms=3.535mA}
R1{V=-0.004pV,I=0A}
```
