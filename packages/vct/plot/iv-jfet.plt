set term svg size 600, 400 dynamic
set output "iv-jfet.svg"
set xlabel "Vds / V"
set ylabel "Id / A"
set border 0
set grid lw 1
set border lw 1
set format y "%g"
set format x "%g"
plot for [IDX=0:4] \
  'iv-jfet.data' \
  index IDX \
  using 1:2 \
  with lines lw 1 \
  title columnheader(1)
