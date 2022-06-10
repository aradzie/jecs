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
V1{V=5V,I=-5mA,P=-25mW}
DUT{V=5V,Vmax=5V,Vmin=5V,Vrms=5V}
R1{V=5V,I=5mA,P=25mW}
```

---

## Netlist

```text
Vac:Vac1 n1 gnd amplitude=5 frequency=1k
Voltmeter:DUT n1 gnd
R:R1 n1 gnd R=1000
.tran timeInterval=3m timeStep=1u
```

## Result

```text
V(n1)=-0.004pV
Vac1{V=-0.004pV,I=0A,P=0W}
DUT{V=-0.004pV,Vmax=5V,Vmin=-5V,Vrms=3.535V}
R1{V=-0.004pV,I=0A,P=0W}
```
