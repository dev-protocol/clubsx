#!/bin/bash

echo "VERCEL_IGNORE: $VERCEL_IGNORE"

if [[ "$VERCEL_IGNORE" != "1" ]] ; then
  echo "✅ - Build can proceed"
  exit 1;

else
  echo "🛑 - Build cancelled"
  exit 0;

fi

