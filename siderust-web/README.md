# @siderust/siderust-web

High-precision astronomy for the **browser** — observer setup, celestial body
tracking, altitude/azimuth events, coordinate transforms, VSOP87 ephemerides,
and lunar phases.  Powered by Rust + WebAssembly.

> **Node.js users**: use [`@siderust/siderust`](../siderust-node/) instead —
> it provides the same API via a native N-API addon with zero-cost FFI.

## Quick start

### With a bundler (Vite / Webpack / Rollup)

```bash
npm install @siderust/siderust-web
```

```js
import init, {
  Observer,
  Star,
  bodyAltitudeAt,
  moonPhase,
  vsop87Heliocentric,
} from '@siderust/siderust-web';

// Initialise the WASM module (must be awaited once before any call)
await init();

// Create an observer at La Palma
const obs = Observer.roqueDeLasMuchachos();

// Sun altitude right now (MJD)
const mjd = 2440587.5 + Date.now() / 86400000 - 2400000.5;
console.log('Sun altitude:', bodyAltitudeAt('Sun', obs, mjd).toFixed(2), '°');

// Moon phase
const jd = mjd + 2400000.5;
const phase = moonPhase(jd);
console.log(`Moon: ${phase.label}, ${(phase.illuminatedFraction * 100).toFixed(0)}% illuminated`);

// Mars heliocentric position
const mars = vsop87Heliocentric('Mars', jd);
console.log(`Mars: x=${mars.x.toFixed(4)} y=${mars.y.toFixed(4)} z=${mars.z.toFixed(4)} AU`);

// Catalog star
const vega = Star.catalog('Vega');
console.log(`Vega altitude: ${starAltitudeAt(vega, obs, mjd).toFixed(2)}°`);

// Free WASM handles when done (GC does not track WASM memory)
obs.free();
vega.free();
```

### Static site / GitHub Pages

No bundler required — serve the built `pkg/` directory alongside your HTML:

```html
<script type="module">
  import init, { Observer, bodyAltitudeAt } from './pkg/siderust_web.js';

  await init();

  const obs = Observer.roqueDeLasMuchachos();
  const mjd = 2440587.5 + Date.now() / 86400000 - 2400000.5;
  document.body.textContent = `Sun altitude: ${bodyAltitudeAt('Sun', obs, mjd).toFixed(2)}°`;
  obs.free();
</script>
```

See [`examples/github-pages/`](examples/github-pages/) for a full interactive demo.

## Building from source

Prerequisites: [Rust](https://rustup.rs/) and
[wasm-pack](https://rustwasm.github.io/wasm-pack/installer/).

```bash
# Install wasm target (once)
rustup target add wasm32-unknown-unknown

# Dev build (fast, unoptimised, ~9 MB WASM)
npm run build:dev

# Release build (LTO + size opt, ~7.4 MB raw / ~2.6 MB gzipped)
npm run build
```

Both commands produce output in `pkg/`.

## API reference

The API mirrors `@siderust/siderust` (the Node package).  Key differences:

| | Node (`@siderust/siderust`) | Web (`@siderust/siderust-web`) |
|---|---|---|
| **Runtime** | Node.js (N-API native addon) | Any modern browser (WASM) |
| **Init** | `require()` / `import` | `await init()` before first call |
| **Memory** | GC-managed | Call `.free()` on `Observer` / `Star` |
| **Package type** | CommonJS | ESM only |

### Classes

- **`Observer`** — `new Observer(lonDeg, latDeg, heightM)`
  - Static factories: `.roqueDeLasMuchachos()`, `.elParanal()`, `.maunaKea()`, `.laSilla()`
  - Getters: `.lonDeg`, `.latDeg`, `.heightM`
  - `.format()`, `.free()`

- **`Star`** — `new Star(name, distanceLy, massSolar, radiusSolar, luminositySolar, raDeg, decDeg)`
  - Factory: `.catalog(name)` — Vega, Sirius, Polaris, Canopus, Arcturus, Rigel, Betelgeuse, Procyon, Aldebaran, Altair
  - Getters: `.name`, `.distanceLy`, `.massSolar`, `.radiusSolar`, `.luminositySolar`, `.raDeg`, `.decDeg`
  - `.format()`, `.free()`

### Functions

**Bodies & catalog**
- `getPlanet(name)` → `PlanetInfo`
- `listBodies()` → `string[]`
- `listCatalogStars()` → `string[]`

**Instantaneous queries** (returns `number`)
- `bodyAltitudeAt(body, observer, mjd)`
- `bodyAzimuthAt(body, observer, mjd)`
- `starAltitudeAt(star, observer, mjd)`
- `starAzimuthAt(star, observer, mjd)`

**Batch event queries** (returns arrays)
- `bodyCrossings(body, observer, startMjd, endMjd, thresholdDeg)` → `CrossingEvent[]`
- `bodyCulminations(body, observer, startMjd, endMjd)` → `CulminationEvent[]`
- `bodyAboveThreshold(body, observer, startMjd, endMjd, thresholdDeg)` → `MjdPeriod[]`
- `bodyBelowThreshold(body, observer, startMjd, endMjd, thresholdDeg)` → `MjdPeriod[]`
- `bodyAzimuthCrossings(body, observer, startMjd, endMjd, bearingDeg)` → `AzimuthCrossingEvent[]`
- `bodyAzimuthExtrema(body, observer, startMjd, endMjd)` → `AzimuthExtremum[]`
- Star equivalents: `starCrossings`, `starCulminations`, `starAboveThreshold`, `starBelowThreshold`, `starAzimuthCrossings`, `starAzimuthExtrema`
- `intersectPeriods(periods1, periods2)` → `MjdPeriod[]`

**Ephemeris**
- `vsop87Heliocentric(body, jd)` → `CartesianPosition`
- `vsop87Barycentric(body, jd)` → `CartesianPosition`
- `vsop87SunBarycentric(jd)`, `vsop87EarthBarycentric(jd)`, `vsop87EarthHeliocentric(jd)`, `vsop87MoonGeocentric(jd)`
- `transformPositionCenter(x, y, z, srcCenter, dstCenter, jd)` → `CartesianPosition`
- `transformPositionFrame(x, y, z, srcFrame, dstFrame, jd)` → `CartesianPosition`
- `orbitalPeriodDays(name)` → `number`

**Coordinates**
- `transformDirection(polarDeg, azimuthDeg, srcFrame, dstFrame, jd)` → `SphericalDirection`
- `directionToHorizontal(polarDeg, azimuthDeg, srcFrame, jd, observer)` → `SphericalDirection`
- `geodeticToEcef(observer)` → `CartesianEcef`
- `angularSeparation(polar1Deg, azimuth1Deg, polar2Deg, azimuth2Deg, frame)` → `number`
- `cartesianDistance(...)`, `cartesianMagnitude(...)`, `dotProduct(...)`, `directionToCartesian(...)`

**Moon phases**
- `moonPhase(jd)` → `MoonPhase`
- `moonPhaseTopocentric(jd, observer)` → `MoonPhase`
- `findPhaseEvents(startMjd, endMjd)` → `PhaseEvent[]`
- `moonIlluminationAbove(startMjd, endMjd, kMin)` → `MjdPeriod[]`
- `moonIlluminationBelow(startMjd, endMjd, kMax)` → `MjdPeriod[]`
- `moonIlluminationRange(startMjd, endMjd, kMin, kMax)` → `MjdPeriod[]`

**Utility**
- `version()` → `string`

## Binary size

| Build | Raw | Gzipped |
|-------|-----|---------|
| Dev   | ~9.4 MB | — |
| Release (LTO + opt-level=s) | ~7.4 MB | ~2.6 MB |

The bulk is compiled-in VSOP87 and ELP2000 polynomial coefficients (no
runtime data downloads needed).

## Hosting requirements

The `.wasm` file must be served with `Content-Type: application/wasm`.
GitHub Pages handles this correctly by default.  Most static file servers
and CDNs also do.

If you encounter issues, verify with:
```bash
curl -sI https://your-site.github.io/pkg/siderust_web_bg.wasm | grep Content-Type
```

## License

AGPL-3.0 — see [LICENSE](../LICENSE).

> **Note**: distributing a browser-run application that uses this library
> implies obligations under AGPL-3.0 to provide corresponding source code
> to users of the web application.
