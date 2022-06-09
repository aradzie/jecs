#!/usr/bin/env bash

node lib/index.js

cd plot

for f in *.plt; do gnuplot "$f"; done
