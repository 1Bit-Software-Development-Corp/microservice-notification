#!/bin/bash

set -euo pipefail
cd ${0%/*}

PREVIEW=$1

NODE_VERSION=$(node -p -e "require('./package.json').version")
./notif.sh "${PREVIEW}"