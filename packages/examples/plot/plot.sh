#!/usr/bin/env bash

for f in *.netlist; do jssim "$f"; done

for f in *.plot; do gnuplot "$f"; done
