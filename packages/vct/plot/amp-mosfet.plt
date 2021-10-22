set term svg size 600, 400 dynamic
set output "amp-mosfet.svg"
set title "MOSFET Amplifier"
set xlabel "Vgs / V"
set grid lw 1
set border lw 1
set format y "%g"
set format x "%g"
plot 'amp-mosfet.data' using 1:2 with lines lw 1 title "Vd(Vgs, Rl)"
