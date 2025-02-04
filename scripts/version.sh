#!/bin/sh
echo "versions<<EOF"
echo
echo "- bun: `bun -v`"
echo "- deno: `deno --version | head -n 1`"
echo "- edge-light: `pnpm run --filter edge-light-runtime version | tail -n 1`"
echo "- fastly: `fastly version | head -n 1`"
echo "- llrt: `llrt -v`"
echo "- netlify: `netlify -v`"
echo "- node: `node -v`"
echo "- wasmer `wasmer run wasmer/winterjs -- -V`"
echo "- workerd: `pnpm run --filter workerd-runtime version | tail -n 1`"
echo
echo EOF