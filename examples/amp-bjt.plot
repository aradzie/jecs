set term svg size 600, 400 dynamic
set output "amp-bjt.svg"
set border lw 1
set grid lw 1
set xlabel "Vbe / V"
plot for [IDX=0:*] \
  "amp-bjt.data" \
  index IDX \
  using 10:3 \
  with lines lw 1 \
  title columnheader(1)
