# GitHub Pages Example

This demo goes through the public `@siderust/siderust-web` API and uses
`@siderust/qtty-web` plus `@siderust/tempoch-web` explicitly for typed
inputs.

## Build the local packages

```bash
cd ../../../qtty-js/qtty-web
npm run build

cd ../../tempoch-js/tempoch-web
npm run build

cd ../../siderust-web
npm run build
```

## Serve the example

From `javascript/siderust-js/siderust-web/examples/github-pages`:

```bash
python3 -m http.server 8080
```

Then open <http://localhost:8080/index.html>.

The page uses an `importmap` that points at the sibling `qtty-web`,
`tempoch-web`, and `siderust-web` packages in this workspace.
