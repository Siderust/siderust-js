#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PACKAGE_DIR="$ROOT_DIR/siderust-node"
WEB_DIR="$ROOT_DIR/siderust-web"
STEP="${1:-all}"

run_install() {
  cd "$PACKAGE_DIR"
  npm ci
}

run_format() {
  cd "$PACKAGE_DIR"
  npm run format:check
}

run_lint() {
  cd "$PACKAGE_DIR"
  npm run lint
}

run_build() {
  cd "$PACKAGE_DIR"
  if [[ "${BUILD_MODE:-debug}" == "release" ]]; then
    npm run build
  else
    npm run build:debug
  fi
}

run_test() {
  cd "$PACKAGE_DIR"
  npm test
}

run_coverage() {
  cd "$PACKAGE_DIR"
  npm run test:coverage
}

# ── WASM (siderust-web) steps ─────────────────────────────────────────────

run_web_build() {
  cd "$WEB_DIR"
  if [[ "${BUILD_MODE:-debug}" == "release" ]]; then
    wasm-pack build --target web --out-dir pkg --release --scope siderust
  else
    wasm-pack build --target web --out-dir pkg --dev --scope siderust
  fi
}

run_web_test() {
  cd "$WEB_DIR"
  if [[ -d "__test__" ]]; then
    npm test
  else
    echo "No WASM tests yet — skipping"
  fi
}

case "$STEP" in
  install)
    run_install
    ;;
  format)
    run_format
    ;;
  lint)
    run_lint
    ;;
  build)
    run_build
    ;;
  test)
    run_test
    ;;
  coverage)
    run_coverage
    ;;
  web-build)
    run_web_build
    ;;
  web-test)
    run_web_test
    ;;
  web)
    run_web_build
    run_web_test
    ;;
  all)
    run_install
    run_format
    run_lint
    run_build
    run_test
    run_coverage
    run_web_build
    run_web_test
    ;;
  *)
    echo "Usage: $0 [install|format|lint|build|test|coverage|web-build|web-test|web|all]" >&2
    exit 1
    ;;
esac
