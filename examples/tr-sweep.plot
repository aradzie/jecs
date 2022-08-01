set term svg size 600, 400 dynamic
set output "tr-sweep.svg"
set border lw 1
set grid lw 1
set xlabel "time"
set ytics nomirror tc lt 1
set ylabel "V(C), V" tc lt 1
set y2tics nomirror tc lt 2
set y2label "I(C), A" tc lt 2
plot \
  for [IDX=0:*] \
  "tr-sweep.data" \
  index IDX \
  using 1:8 \
  axes x1y1 \
  with lines lw 1 \
  title columnheader(1), \
  for [IDX=0:*] \
  "tr-sweep.data" \
  index IDX \
  using 1:9 \
  axes x1y2 \
  with lines lw 1 \
  title columnheader(1)
