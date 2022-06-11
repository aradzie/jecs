set term svg size 600, 400 dynamic
set output "amp-mosfet.svg"
set border lw 1
set grid lw 1
set xlabel "Vgs / V"
plot for [IDX=0:*] \
  "amp-mosfet.data" \
  index IDX \
  using 13:3 \
  with lines lw 1 \
  title columnheader(1)
