set term svg size 600, 400 dynamic
set output "tr-lc.svg"
set border lw 1
set grid lw 1
set xlabel "time"
set ylabel "V(R), V"
plot \
  for [IDX=0:*] \
  "tr-lc.data" \
  index IDX \
  using 1:4 \
  with lines lw 1 \
  title columnheader(1)
