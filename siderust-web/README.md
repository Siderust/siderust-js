# `@siderust/siderust-web`

Browser/WASM bindings for Siderust with the same strict typed API as the
Node package.

Call `init()` before constructing `Quantity`, `JulianDate`, `Observer`, or
any other typed object used with this package. `init()` bootstraps
`@siderust/qtty-web`, `@siderust/tempoch-web`, and the main `siderust-web`
wasm bundle together.

## Install

```bash
npm install @siderust/siderust-web @siderust/qtty-web @siderust/tempoch-web
```

## Example

```js
import { Quantity } from '@siderust/qtty-web';
import { JulianDate, ModifiedJulianDate, Period } from '@siderust/tempoch-web';
import {
  init,
  Observer,
  bodyAltitudeAt,
  bodyCrossings,
  moonPhase,
  vsop87Heliocentric,
} from '@siderust/siderust-web';

await init();

const DEG = (value) => new Quantity(value, 'Degree');
const M = (value) => new Quantity(value, 'Meter');

const observer = new Observer(DEG(-17.8925), DEG(28.7543), M(2396));
const jd = new JulianDate(2_451_545.0);
const mjd = new ModifiedJulianDate(60_000.0);
const window = new Period(mjd, new ModifiedJulianDate(60_001.0));

console.log(bodyAltitudeAt('Sun', observer, mjd).toString());
console.log(bodyCrossings('Sun', observer, window, DEG(0)));
console.log(moonPhase(jd).phaseAngle.toString());
console.log(vsop87Heliocentric('Mars', jd).x.toString());
```

## API shape

- `jd` parameters require `JulianDate`.
- Instant `mjd` parameters require `ModifiedJulianDate`.
- Search windows use `Period`.
- Observer/star/domain quantities require `Quantity`.
- Event timestamps are returned as `ModifiedJulianDate`.
- Period searches return `Period[]`.
- Angles, lengths, and other physical outputs return `Quantity`.

## Core exports

- `init()`
- `Observer`
- `Star`
- `transformDirection(...)`
- `directionToHorizontal(...)`
- `geodeticToEcef(...)`
- `angularSeparation(...)`
- `cartesianDistance(...)`
- `cartesianMagnitude(...)`
- `directionToCartesian(...)`
- `vsop87Heliocentric(...)`
- `vsop87Barycentric(...)`
- `vsop87SunBarycentric(...)`
- `vsop87EarthBarycentric(...)`
- `vsop87EarthHeliocentric(...)`
- `vsop87MoonGeocentric(...)`
- `transformPositionCenter(...)`
- `transformPositionFrame(...)`
- `orbitalPeriod(...)`
- `bodyAltitudeAt(...)`
- `bodyAzimuthAt(...)`
- `bodyCrossings(...)`
- `bodyCulminations(...)`
- `bodyAboveThreshold(...)`
- `bodyBelowThreshold(...)`
- `bodyAzimuthCrossings(...)`
- `bodyAzimuthExtrema(...)`
- `starAltitudeAt(...)`
- `starAzimuthAt(...)`
- `starCrossings(...)`
- `starCulminations(...)`
- `starAboveThreshold(...)`
- `starBelowThreshold(...)`
- `starAzimuthCrossings(...)`
- `starAzimuthExtrema(...)`
- `intersectPeriods(...)`
- `moonPhase(...)`
- `moonPhaseTopocentric(...)`
- `findPhaseEvents(...)`
- `moonIlluminationAbove(...)`
- `moonIlluminationBelow(...)`
- `moonIlluminationRange(...)`
