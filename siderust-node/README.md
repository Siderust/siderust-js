# @siderust/siderust

**Astronomical computations for Node.js — powered by Rust.**

`@siderust/siderust` wraps the [`siderust`](https://github.com/Siderust/siderust)
Rust crate via [napi-rs](https://napi.rs) to provide:

- **Observer** — geodetic site on the WGS84 ellipsoid with preset observatories.
- **Body & Star** — solar-system body identifiers and a 10-star catalog.
- **Altitude / Azimuth** — instantaneous topocentric altitude and azimuth for
  bodies and stars, plus threshold crossings, culminations, and visibility
  windows over arbitrary time spans.
- **Ephemeris** — VSOP87 (Series A & E) heliocentric / barycentric positions for
  planets and the Sun; ELP2000 geocentric Moon position.
- **Coordinate transforms** — spherical direction conversion across ICRS,
  Ecliptic, Equatorial (mean/true, J2000/of-date), and Horizontal frames.
- **Moon phases** — geocentric & topocentric phase geometry, principal phase
  event search, and illumination-fraction threshold queries.
- **TypeScript declarations** with string-literal union types.

All computation runs in Rust; the JS/TS layer is a thin ergonomic façade.

---

## Quick start

```js
const {
  Observer, Star, bodyAltitudeAt, bodyCrossings,
  starAltitudeAt, moonPhase, vsop87Heliocentric,
} = require('@siderust/siderust');

// 1. Observer site
const obs = Observer.roqueDeLasMuchachos();

// 2. Sun altitude at a given MJD
const alt = bodyAltitudeAt('Sun', obs, 60000.0);
console.log(`Sun altitude: ${alt.toFixed(2)}°`);

// 3. Sunrise / sunset (horizon crossings over 1 day)
const events = bodyCrossings('Sun', obs, 60000.0, 60001.0, 0);
events.forEach(e => console.log(`  ${e.direction} MJD ${e.mjd.toFixed(5)}`));

// 4. Star altitude
const vega = Star.catalog('Vega');
console.log(`Vega alt: ${starAltitudeAt(vega, obs, 60000.0).toFixed(2)}°`);

// 5. Moon phase
const phase = moonPhase(2451545.0);
console.log(`Moon: ${phase.label} (${(phase.illuminatedFraction * 100).toFixed(0)}%)`);

// 6. Planet ephemeris
const mars = vsop87Heliocentric('Mars', 2451545.0);
console.log(`Mars: x=${mars.x.toFixed(4)} y=${mars.y.toFixed(4)} z=${mars.z.toFixed(4)} AU`);
```

```ts
// TypeScript
import {
  Observer, Star, JsObserver, JsStar,
  bodyAltitudeAt, bodyCrossings, CrossingEvent,
  moonPhase, MoonPhase,
} from '@siderust/siderust';

const obs: JsObserver = Observer.roqueDeLasMuchachos();
const alt: number = bodyAltitudeAt('Sun', obs, 60000.0);
const events: CrossingEvent[] = bodyCrossings('Sun', obs, 60000.0, 60001.0, 0);
```

---

## Installation

```bash
npm install @siderust/siderust
```

The package ships a pre-built native addon for the current platform.
To build from source, see [Building from source](#building-from-source).

---

## API

### `Observer`

A geodetic position on the WGS84 ellipsoid, used as the reference site for all
topocentric computations.

#### Constructors / factories

| Method | Description |
|--------|-------------|
| `new Observer(lonDeg, latDeg, heightM)` | Custom site. East-positive longitude, north-positive latitude, height in metres. |
| `Observer.roqueDeLasMuchachos()` | La Palma, Spain (−17.89°, +28.75°, 2396 m). |
| `Observer.elParanal()` | ESO Paranal, Chile (−70.40°, −24.63°, 2635 m). |
| `Observer.maunaKea()` | Hawaiʻi, USA (−155.47°, +19.82°, 4207 m). |
| `Observer.laSilla()` | ESO La Silla, Chile (−70.73°, −29.26°, 2400 m). |

#### Accessors

| Member | Type | Description |
|--------|------|-------------|
| `.lonDeg` | `number` | Longitude in degrees (east positive). |
| `.latDeg` | `number` | Latitude in degrees (north positive). |
| `.heightM` | `number` | Height above WGS84 ellipsoid in metres. |
| `.format()` | `string` | Human-readable representation. |

---

### `Star`

A star with physical parameters and J2000.0 sky coordinates.

#### Constructors / factories

| Method | Description |
|--------|-------------|
| `new Star(name, distanceLy, massSolar, radiusSolar, luminositySolar, raDeg, decDeg)` | Custom star. |
| `Star.catalog(name)` | Look up a built-in star by name (case-insensitive). |

Built-in catalog: **Vega**, **Sirius**, **Polaris**, **Canopus**, **Arcturus**,
**Rigel**, **Betelgeuse**, **Procyon**, **Aldebaran**, **Altair**.

#### Accessors

| Member | Type | Description |
|--------|------|-------------|
| `.name` | `string` | Star name. |
| `.distanceLy` | `number` | Distance in light-years. |
| `.massSolar` | `number` | Mass in solar masses (M☉). |
| `.radiusSolar` | `number` | Radius in solar radii (R☉). |
| `.luminositySolar` | `number` | Luminosity in solar luminosities (L☉). |
| `.raDeg` | `number` | Right ascension at J2000.0 in degrees. |
| `.decDeg` | `number` | Declination at J2000.0 in degrees. |
| `.format()` | `string` | Human-readable representation. |

---

### Body & planet helpers

| Function | Returns | Description |
|----------|---------|-------------|
| `listBodies()` | `string[]` | Names of all solar-system bodies (Sun, Moon, Mercury–Neptune). |
| `listCatalogStars()` | `string[]` | Names of all built-in catalog stars. |
| `getPlanet(name)` | `PlanetInfo` | Physical parameters for a planet. |

`PlanetInfo` fields: `name`, `massKg`, `radiusKm`, `semiMajorAxisAu`,
`eccentricity`, `inclinationDeg`.

---

### Altitude & azimuth (bodies)

All functions take `body: string` — one of `"Sun"`, `"Moon"`, `"Mercury"`,
`"Venus"`, `"Mars"`, `"Jupiter"`, `"Saturn"`, `"Uranus"`, `"Neptune"`.

| Function | Returns | Description |
|----------|---------|-------------|
| `bodyAltitudeAt(body, observer, mjd)` | `number` | Altitude in degrees at a single instant. |
| `bodyAzimuthAt(body, observer, mjd)` | `number` | Azimuth in degrees (N=0° E=90°). |
| `bodyCrossings(body, observer, startMjd, endMjd, thresholdDeg)` | `CrossingEvent[]` | Altitude threshold crossings (rise/set). |
| `bodyCulminations(body, observer, startMjd, endMjd)` | `CulminationEvent[]` | Local altitude extrema (upper/lower transit). |
| `bodyAboveThreshold(body, observer, startMjd, endMjd, thresholdDeg)` | `MjdPeriod[]` | Time periods above an altitude threshold. |
| `bodyBelowThreshold(body, observer, startMjd, endMjd, thresholdDeg)` | `MjdPeriod[]` | Time periods below an altitude threshold. |
| `bodyAzimuthCrossings(body, observer, startMjd, endMjd, bearingDeg)` | `AzimuthCrossingEvent[]` | Azimuth crossing events. |
| `bodyAzimuthExtrema(body, observer, startMjd, endMjd)` | `AzimuthExtremum[]` | Local azimuth max/min events. |

---

### Altitude & azimuth (stars)

| Function | Returns | Description |
|----------|---------|-------------|
| `starAltitudeAt(star, observer, mjd)` | `number` | Altitude in degrees. |
| `starAzimuthAt(star, observer, mjd)` | `number` | Azimuth in degrees. |
| `starCrossings(star, observer, startMjd, endMjd, thresholdDeg)` | `CrossingEvent[]` | Rise/set events. |
| `starCulminations(star, observer, startMjd, endMjd)` | `CulminationEvent[]` | Culmination events. |
| `starAboveThreshold(star, observer, startMjd, endMjd, thresholdDeg)` | `MjdPeriod[]` | Visibility windows. |
| `starBelowThreshold(star, observer, startMjd, endMjd, thresholdDeg)` | `MjdPeriod[]` | Below-threshold periods. |

---

### Result types

```ts
interface CrossingEvent     { mjd: number; direction: 'rising' | 'setting' }
interface CulminationEvent  { mjd: number; altitudeDeg: number; kind: 'max' | 'min' }
interface MjdPeriod         { startMjd: number; endMjd: number }
interface AzimuthCrossingEvent { mjd: number; direction: 'rising' | 'setting' }
interface AzimuthExtremum   { mjd: number; azimuthDeg: number; kind: 'max' | 'min' }
```

---

### Ephemeris (VSOP87 / ELP2000)

| Function | Returns | Description |
|----------|---------|-------------|
| `vsop87Heliocentric(body, jd)` | `CartesianPosition` | Heliocentric ecliptic position (AU). Body: Mercury–Neptune. |
| `vsop87Barycentric(body, jd)` | `CartesianPosition` | Barycentric ecliptic position (AU). Body: planets or `"Sun"`. |
| `vsop87SunBarycentric(jd)` | `CartesianPosition` | Sun barycentric position (AU). |
| `vsop87EarthBarycentric(jd)` | `CartesianPosition` | Earth barycentric position (AU). |
| `vsop87EarthHeliocentric(jd)` | `CartesianPosition` | Earth heliocentric position (AU). |
| `vsop87MoonGeocentric(jd)` | `CartesianPosition` | Moon geocentric position (**km**). |

```ts
interface CartesianPosition { x: number; y: number; z: number; frame: string; center: string }
```

All positions are in the `EclipticMeanJ2000` frame. `jd` is a Julian Date.

---

### Coordinate transforms

| Function | Returns | Description |
|----------|---------|-------------|
| `transformDirection(polarDeg, azimuthDeg, srcFrame, dstFrame, jd)` | `SphericalDirection` | Transform between celestial frames. |
| `directionToHorizontal(polarDeg, azimuthDeg, srcFrame, jd, observer)` | `SphericalDirection` | Project onto local Horizontal frame. |
| `geodeticToEcef(observer)` | `CartesianEcef` | WGS84 → ECEF Cartesian (metres). |

Supported frames: `"ICRS"`, `"EclipticMeanJ2000"`, `"EquatorialMeanJ2000"`,
`"EquatorialMeanOfDate"`, `"EquatorialTrueOfDate"`.

```ts
interface SphericalDirection { polarDeg: number; azimuthDeg: number; frame: string }
interface CartesianEcef      { x: number; y: number; z: number }
```

---

### Moon phases

| Function | Returns | Description |
|----------|---------|-------------|
| `moonPhase(jd)` | `MoonPhase` | Geocentric phase geometry at a Julian Date. |
| `moonPhaseTopocentric(jd, observer)` | `MoonPhase` | Topocentric phase geometry. |
| `findPhaseEvents(startMjd, endMjd)` | `PhaseEvent[]` | Principal phase events in a window. |
| `moonIlluminationAbove(startMjd, endMjd, kMin)` | `MjdPeriod[]` | Periods with illumination ≥ kMin. |
| `moonIlluminationBelow(startMjd, endMjd, kMax)` | `MjdPeriod[]` | Periods with illumination ≤ kMax. |
| `moonIlluminationRange(startMjd, endMjd, kMin, kMax)` | `MjdPeriod[]` | Periods with kMin ≤ illumination ≤ kMax. |

```ts
interface MoonPhase {
  phaseAngleDeg: number;
  illuminatedFraction: number;  // [0, 1]
  elongationDeg: number;
  waxing: boolean;
  label: 'NewMoon' | 'WaxingCrescent' | 'FirstQuarter' | 'WaxingGibbous'
       | 'FullMoon' | 'WaningGibbous' | 'LastQuarter' | 'WaningCrescent';
}

interface PhaseEvent {
  mjd: number;
  kind: 'NewMoon' | 'FirstQuarter' | 'FullMoon' | 'LastQuarter';
}
```

---

### Utility

| Function | Returns | Description |
|----------|---------|-------------|
| `version()` | `string` | Package version string. |

---

## Time conventions

- **JD** (Julian Date) — continuous day count since the Julian Period origin.
  J2000.0 = JD 2 451 545.0. Used by ephemeris and coordinate transform functions.
- **MJD** (Modified Julian Date) — `JD − 2 400 000.5`.
  J2000.0 = MJD 51 544.5. Used by all event-search and altitude/azimuth functions.
- Use [`@siderust/tempoch`](https://www.npmjs.com/package/@siderust/tempoch) for
  JD ↔ MJD ↔ `Date` conversions and ΔT corrections.

---

## Examples

| File | Description |
|------|-------------|
| [examples/quickstart.mjs](examples/quickstart.mjs) | Observer setup, Sun rise/set, star altitude |
| [examples/night_events.mjs](examples/night_events.mjs) | Twilight boundaries, culminations, visibility windows |
| [examples/star_observability.mjs](examples/star_observability.mjs) | Catalog stars, above-threshold periods, custom stars |
| [examples/ephemeris.mjs](examples/ephemeris.mjs) | VSOP87 planet positions, coordinate frame transforms |
| [examples/moon_phases.mjs](examples/moon_phases.mjs) | Phase events, illumination thresholds, dark-sky periods |

Run any example directly:

```bash
node examples/quickstart.mjs
```

---

## Building from source

Requirements: **Rust ≥ 1.75**, **Node.js ≥ 18**, **napi-rs CLI 2.x**.

```bash
git clone https://github.com/Siderust/siderust
cd javascript/siderust-js/siderust-node

# Install JS dev dependencies (includes @napi-rs/cli)
npm install

# Debug build
npm run build:debug

# Optimised release build
npm run build
```

---

## Architecture

```
@siderust/siderust (JS/TS)
        │
        │  napi-rs bindings  (src/*.rs)
        ▼
siderust  (Rust crate — VSOP87, ELP2000, event search, coordinate transforms)
        │
        ├── tempoch    (time primitives, ΔT)
        ├── qtty       (physical quantities & units)
        └── affn       (linear algebra)
```

The native addon is a `cdylib` Rust crate that depends directly on `siderust`.
No C FFI layer is involved — napi-rs generates the V8 bridge directly.

---

## License

AGPL-3.0-only — see [LICENSE](LICENSE).

© 2026 Vallés Puig, Ramon
