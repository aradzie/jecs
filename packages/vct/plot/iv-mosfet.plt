set term svg size 600, 400 dynamic
set output "iv-mosfet.svg"
set title "MOSFET I-V curve"
set xlabel "Vds / V"
set ylabel "Id / A"
set grid lw 1
set border lw 1
set format y "%g"
set format x "%g"
plot 'iv-mosfet.data' using 1:2 with lines lw 1 title "Id(Vgs)"
