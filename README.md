# siderust-js workspace

JavaScript and WebAssembly bindings for Siderust astronomy.

This repository is the publishable JS workspace. It contains the npm packages,
the shared Rust binding core used by both targets, and the Node/Web transport
layers that expose the public JS API.

The public surface is strongly typed around `qtty-js` and `tempoch-js`:
quantities must be passed as `@siderust/qtty` or `@siderust/qtty-web`
`Quantity` objects, and times and windows must be passed as
`@siderust/tempoch` or `@siderust/tempoch-web` `JulianDate`,
`ModifiedJulianDate`, and `Period` objects.

## Packages

| Package | Target | Status | Notes |
| --- | --- | --- | --- |
| [`@siderust/siderust`](./siderust-node/README.md) | Node.js | `0.1.0` | Native addon built with `napi-rs`; requires `@siderust/qtty` and `@siderust/tempoch` objects at the public API boundary. |
| [`@siderust/siderust-web`](./siderust-web/README.md) | Browsers / bundlers | `0.1.0` | WebAssembly build with `wasm-bindgen`; requires `await init()` plus `@siderust/qtty-web` and `@siderust/tempoch-web` objects in the API. |

The Node and Web packages are intended to stay aligned. Platform differences
are transport details, not separate domain models.

## Repository layout

```text
siderust-js/
├── siderust-core/  Shared Rust binding logic used by both targets
├── siderust-node/  Node package: @siderust/siderust
├── siderust-web/   Browser package: @siderust/siderust-web
└── scripts/        CI helpers for the Node package
```

## What ships in 0.1.0

- A Node package exposing observer and star models, coordinate transforms,
  ephemerides, altitude/azimuth event search, time-window intersection, and
  lunar phase helpers.
- A browser/WASM package exposing the same astronomy surface with explicit
  asynchronous initialization via `init()`.
- A strict typed JS API that uses `Quantity`, `JulianDate`,
  `ModifiedJulianDate`, and `Period` at the public boundary rather than raw
  numbers or `*Like` aliases.
- TypeScript declarations for both packages matching the runtime surface.
- Node and Web tests, examples, and package-level READMEs for the current API.

## Install

### Node.js

```bash
npm install @siderust/siderust @siderust/qtty @siderust/tempoch
```

```js
const { Quantity } = require('@siderust/qtty');
const { JulianDate } = require('@siderust/tempoch');
const { Observer, bodyAltitudeAt } = require('@siderust/siderust');

const observer = new Observer(
  new Quantity(-17.8925, 'Degree'),
  new Quantity(28.7543, 'Degree'),
  new Quantity(2396, 'Meter'),
);

const altitude = bodyAltitudeAt(
  'Sun',
  observer,
  new JulianDate(2451545.0).toModifiedJulianDate(),
);

console.log(altitude.value, altitude.unit);
```

### Browser / WebAssembly

```bash
npm install @siderust/siderust-web @siderust/qtty-web @siderust/tempoch-web
```

```js
import { init as initQtty, Quantity } from '@siderust/qtty-web';
import { init as initTempoch, JulianDate } from '@siderust/tempoch-web';
import { init, vsop87Heliocentric } from '@siderust/siderust-web';

await initQtty();
await initTempoch();
await init();

const mars = vsop87Heliocentric('Mars', new JulianDate(2451545.0));
console.log(mars.x.to('Kilometer').value);
```

## Development

Clone the repository:

```bash
git clone git@github.com:Siderust/siderust-js.git
cd siderust-js
```

### Node package workflow

```bash
cd siderust-node
npm ci
npm run build:debug
npm test
```

The repository also exposes CI helpers:

```bash
./scripts/ci.sh all
```

### Web package workflow

`siderust-web` uses `wasm-pack`:

```bash
cd siderust-web
wasm-pack build --target web --out-dir pkg --release --scope siderust
npm test
```

## Related documentation

- [`siderust-node/README.md`](./siderust-node/README.md) for the Node package
  API and examples.
- [`siderust-web/README.md`](./siderust-web/README.md) for the Web package API
  and examples.

## License

AGPL-3.0. See [LICENSE](./LICENSE).
