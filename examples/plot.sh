#!/usr/bin/env bash

for f in *.netlist; do echo "jssim $f"; jssim "$f"; done

for f in *.plot; do echo "gnuplot $f"; gnuplot "$f"; done
