# GitHub Pages Example

A minimal static page that loads Siderust via WebAssembly and runs
astronomy computations entirely in the browser.

## Serving locally

1. Build the WASM package from the repo root:

```bash
cd siderust-web
npm run build        # or: wasm-pack build --target web --out-dir pkg --release
```

2. Serve this directory with any static file server:

```bash
# Python
python3 -m http.server 8080 --directory .

# Node.js (npx)
npx serve .
```

3. Open <http://localhost:8080/examples/github-pages/index.html>

## Deploying to GitHub Pages

Copy the contents of `pkg/` and `examples/github-pages/` into your
GitHub Pages directory.  The `index.html` expects the import path
`../../pkg/siderust_web.js` — adjust if your directory layout differs.

GitHub Pages serves `.wasm` files with the correct MIME type
(`application/wasm`) by default, so no extra configuration is needed.

## What the demo shows

- Observatory selector (four preset locations)
- Real-time Sun altitude and azimuth
- Current Moon phase and illumination
- Heliocentric positions of all eight planets
- Catalog star altitudes at your chosen observatory
- Horizon-crossing events for the Sun (next 24 hours)
