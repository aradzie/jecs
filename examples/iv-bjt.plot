set term svg size 600, 400 dynamic
set output "iv-bjt.svg"
set xlabel "Vce / V"
set ylabel "Ic / A"
set border 0
set grid lw 1
set border lw 1
set format y "%g"
set format x "%g"
plot for [IDX=0:*] \
  'iv-bjt.data' \
  index IDX \
  using 11:13 \
  with lines lw 1 \
  title columnheader(1)
