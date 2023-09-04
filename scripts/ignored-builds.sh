#!/bin/bash

if [ -z $VERCEL_IGNORE ]; then
  exit 0
else
  exit 1
fi;
