#!/usr/bin/env bash

set -e

yarn tsc --skipLibCheck
yarn eslint . --ext .js,.jsx,.ts,.tsx --fix
yarn pretty-quick --staged