#!/bin/bash

set -e

instruction()
{
  echo "usage: ./deploy.sh <env>"
  echo ""
  echo "env: eg. int, staging, prod, ..."
  echo ""
  echo "for example: ./deploy.sh int"
}

if [ $# -eq 0 ]; then
  instruction
  exit 1
elif [ $# -eq 1 ]; then
  STAGE=$1

  npm install
  'node_modules/.bin/sls' deploy -s $STAGE -r us-east-1
else
  instruction
  exit 1
fi