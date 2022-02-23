#!/usr/bin/env bash

# Generate client code
npm run gen

patch-package

# Replace aegir's tsc with tsc-silent so we can ignore errors in generated code
mv node_modules/aegir/node_modules/typescript/bin/tsc node_modules/aegir/node_modules/typescript/bin/tsc-bak
ln -fs $(realpath --relative-to=node_modules/aegir/node_modules/typescript/bin $(npm bin)/tsc-silent) node_modules/aegir/node_modules/typescript/bin/tsc
