## Netlist

```text
V:V1 n1 gnd V=5
Voltmeter:DUT n1 gnd
R:R1 n1 gnd R=1000
.dc
```

## Result

```text
V(n1)=5V
V1{V=5V,I=-5mA}
DUT{V=5V,Vmax=NaN,Vmin=NaN,Vrms=NaN}
R1{V=5V,I=5mA}
```

---

## Netlist

```text
Vac:Vac1 n1 gnd V=5 f=1k
Voltmeter:DUT n1 gnd
R:R1 n1 gnd R=1000
.tran stopTime=3m timeStep=1u
```

## Result

```text
V(n1)=-0.004pV
Vac1{V=-0.004pV,I=0A}
DUT{V=-0.004pV,Vmax=5V,Vmin=-5V,Vrms=3.535V}
R1{V=-0.004pV,I=0A}
```
