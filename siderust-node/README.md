# `@siderust/siderust`

High-precision astronomy for Node.js with a strict typed boundary.

Time inputs use `@siderust/tempoch`. Physical quantities use
`@siderust/qtty`. Raw numbers are no longer accepted for domain values such
as epochs, angles, lengths, or observer/star properties.

## Install

```bash
npm install @siderust/siderust @siderust/qtty @siderust/tempoch
```

## Example

```js
const { Quantity } = require('@siderust/qtty');
const { JulianDate, ModifiedJulianDate, Period } = require('@siderust/tempoch');
const {
  Observer,
  bodyAltitudeAt,
  bodyCrossings,
  moonPhase,
  vsop87Heliocentric,
} = require('@siderust/siderust');

const DEG = (value) => new Quantity(value, 'Degree');
const M = (value) => new Quantity(value, 'Meter');

const observer = new Observer(DEG(-17.8925), DEG(28.7543), M(2396));
const jd = new JulianDate(2_451_545.0);
const mjd = new ModifiedJulianDate(60_000.0);
const window = new Period(mjd, new ModifiedJulianDate(60_001.0));

const sunAltitude = bodyAltitudeAt('Sun', observer, mjd);
const sunCrossings = bodyCrossings('Sun', observer, window, DEG(0));
const moon = moonPhase(jd);
const mars = vsop87Heliocentric('Mars', jd);

console.log(sunAltitude.toString());
console.log(sunCrossings[0].mjd.value);
console.log(moon.phaseAngle.toString());
console.log(mars.x.toString());
```

## Public API

### Domain classes

- `new Observer(lon, lat, height)`
  `lon` / `lat` must be angle `Quantity` values and `height` must be a length `Quantity`.
- `new Star(name, distance, mass, radius, luminosity, ra, dec)`
  Every physical field must be a `Quantity`.

### Time-aware functions

- Any `jd` parameter requires a `JulianDate`.
- Any instantaneous `mjd` parameter requires a `ModifiedJulianDate`.
- Search windows use `Period`.

### Typed outputs

- Angular results return `Quantity` values in degrees.
- Cartesian positions return `Quantity` coordinates in their documented units.
- Event timestamps return `ModifiedJulianDate`.
- Interval results return `Period[]`.

## Main exports

- `transformDirection(polar, azimuth, srcFrame, dstFrame, jd)`
- `directionToHorizontal(polar, azimuth, srcFrame, jd, observer)`
- `geodeticToEcef(observer)`
- `angularSeparation(...)`
- `cartesianDistance(...)`
- `cartesianMagnitude(...)`
- `directionToCartesian(polar, azimuth)`
- `vsop87Heliocentric(body, jd)`
- `vsop87Barycentric(body, jd)`
- `vsop87SunBarycentric(jd)`
- `vsop87EarthBarycentric(jd)`
- `vsop87EarthHeliocentric(jd)`
- `vsop87MoonGeocentric(jd)`
- `transformPositionCenter(x, y, z, srcCenter, dstCenter, jd)`
- `transformPositionFrame(x, y, z, srcFrame, dstFrame, jd)`
- `orbitalPeriod(name)`
- `bodyAltitudeAt(body, observer, mjd)`
- `bodyAzimuthAt(body, observer, mjd)`
- `bodyCrossings(body, observer, window, threshold)`
- `bodyCulminations(body, observer, window)`
- `bodyAboveThreshold(body, observer, window, threshold)`
- `bodyBelowThreshold(body, observer, window, threshold)`
- `bodyAzimuthCrossings(body, observer, window, bearing)`
- `bodyAzimuthExtrema(body, observer, window)`
- `starAltitudeAt(star, observer, mjd)`
- `starAzimuthAt(star, observer, mjd)`
- `starCrossings(star, observer, window, threshold)`
- `starCulminations(star, observer, window)`
- `starAboveThreshold(star, observer, window, threshold)`
- `starBelowThreshold(star, observer, window, threshold)`
- `starAzimuthCrossings(star, observer, window, bearing)`
- `starAzimuthExtrema(star, observer, window)`
- `intersectPeriods(periods1, periods2)`
- `moonPhase(jd)`
- `moonPhaseTopocentric(jd, observer)`
- `findPhaseEvents(window)`
- `moonIlluminationAbove(window, kMin)`
- `moonIlluminationBelow(window, kMax)`
- `moonIlluminationRange(window, kMin, kMax)`
