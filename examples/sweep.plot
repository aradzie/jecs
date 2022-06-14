set term svg size 600, 400 dynamic
set output "sweep.svg"
set border lw 1
set grid lw 1
set xlabel "time"
set ylabel "V(C1)"
plot for [IDX=0:*] \
  "sweep.data" \
  index IDX \
  using 1:10 \
  with lines lw 1 \
  title columnheader(1)
