## Netlist

```text
V:Vp np gnd V=0
V:Vn nn gnd V=0
OpAmp:DUT np nn no
R:Rl no gnd R=1000
.dc
```

## Result

```text
V(np)=0V
V(nn)=0V
V(no)=0V
Vp{V=0V,I=0A,P=0W}
Vn{V=0V,I=0A,P=0W}
DUT{Vin=0V,Vout=0V}
Rl{V=0V,I=0A,P=0W}
```

---

## Netlist

```text
V:Vp np gnd V=1
V:Vn nn gnd V=0
OpAmp:DUT np nn no
R:Rl no gnd R=1000
.dc
```

## Result

```text
V(np)=1V
V(nn)=0V
V(no)=15V
Vp{V=1V,I=0A,P=0W}
Vn{V=0V,I=0A,P=0W}
DUT{Vin=1V,Vout=15V}
Rl{V=15V,I=15mA,P=224.997mW}
```

---

## Netlist

```text
V:Vp np gnd V=0
V:Vn nn gnd V=1
OpAmp:DUT np nn no
R:Rl no gnd R=1000
.dc
```

## Result

```text
V(np)=0V
V(nn)=1V
V(no)=-15V
Vp{V=0V,I=0A,P=0W}
Vn{V=1V,I=0A,P=0W}
DUT{Vin=-1V,Vout=-15V}
Rl{V=-15V,I=-15mA,P=224.997mW}
```

---

## Netlist

```text
.eq $d = 1e-3
V:Vp np gnd V=0 + $d
V:Vn nn gnd V=0 - $d
OpAmp:DUT np nn no gain=1e3
R:Rl no gnd R=1000
.dc
```

## Result

```text
V(np)=1mV
V(nn)=-1mV
V(no)=1.972V
Vp{V=1mV,I=0A,P=0W}
Vn{V=-1mV,I=0A,P=0W}
DUT{Vin=2mV,Vout=1.972V}
Rl{V=1.972V,I=1.972mA,P=3.887mW}
```
