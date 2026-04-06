/**
 * @siderust/siderust-web — Typed wrapper functions.
 *
 * These wrappers enforce the public JS domain types and map the raw wasm
 * transport values back into `Quantity`, `JulianDate`, `ModifiedJulianDate`,
 * and `Period` objects.
 *
 * @module @siderust/siderust-web/lib/wrappers
 * @private
 */

import { Quantity } from '@siderust/qtty-web';
import { JulianDate, ModifiedJulianDate, Period } from '@siderust/tempoch-web';
import * as backend from './backend.js';
import { Observer } from './Observer.js';
import { Star } from './Star.js';

function toNativeObserver(obs) {
  if (!(obs instanceof Observer)) {
    throw new Error('Expected an Observer');
  }
  return obs.toNative();
}

function toNativeStar(star) {
  if (!(star instanceof Star)) {
    throw new Error('Expected a Star');
  }
  return star.toNative();
}

function toJdValue(jd) {
  if (!(jd instanceof JulianDate)) {
    throw new Error('Expected a JulianDate');
  }
  return jd.value;
}

function toMjdValue(mjd) {
  if (!(mjd instanceof ModifiedJulianDate)) {
    throw new Error('Expected a ModifiedJulianDate');
  }
  return mjd.value;
}

function toWindow(window) {
  if (!(window instanceof Period)) {
    throw new Error('Expected a Period');
  }
  return {
    start: window.start.value,
    end: window.end.value,
  };
}

function toQuantity(value, unit, label) {
  if (!(value instanceof Quantity)) {
    throw new Error(`${label}: expected a Quantity`);
  }
  return value.to(unit);
}

function toScalar(value, unit, label) {
  return toQuantity(value, unit, label).value;
}

function toAngleValue(value, label) {
  return toScalar(value, 'Degree', label);
}

function toLengthTriple(x, y, z, label) {
  const xQuantity = toQuantity(x, x && x.unit ? x.unit : 'Meter', `${label}.x`);
  return {
    unit: xQuantity.unit,
    x: xQuantity.value,
    y: toQuantity(y, xQuantity.unit, `${label}.y`).value,
    z: toQuantity(z, xQuantity.unit, `${label}.z`).value,
  };
}

function mapPlanetInfo(raw) {
  return {
    name: raw.name,
    mass: new Quantity(raw.massKg, 'Kilogram'),
    radius: new Quantity(raw.radiusKm, 'Kilometer'),
    semiMajorAxis: new Quantity(raw.semiMajorAxisAu, 'AstronomicalUnit'),
    eccentricity: raw.eccentricity,
    inclination: new Quantity(raw.inclinationDeg, 'Degree'),
  };
}

function mapDirection(raw) {
  return {
    polar: new Quantity(raw.polarDeg, 'Degree'),
    azimuth: new Quantity(raw.azimuthDeg, 'Degree'),
    frame: raw.frame,
  };
}

function mapCartesianEcef(raw) {
  return {
    x: new Quantity(raw.x, 'Meter'),
    y: new Quantity(raw.y, 'Meter'),
    z: new Quantity(raw.z, 'Meter'),
  };
}

function mapCartesianPosition(raw, unit) {
  return {
    x: new Quantity(raw.x, unit),
    y: new Quantity(raw.y, unit),
    z: new Quantity(raw.z, unit),
    frame: raw.frame,
    center: raw.center,
  };
}

function mapCrossingEvent(raw) {
  return {
    mjd: new ModifiedJulianDate(raw.mjd),
    direction: raw.direction,
  };
}

function mapCulminationEvent(raw) {
  return {
    mjd: new ModifiedJulianDate(raw.mjd),
    altitude: new Quantity(raw.altitudeDeg, 'Degree'),
    kind: raw.kind,
  };
}

function mapAzimuthExtremum(raw) {
  return {
    mjd: new ModifiedJulianDate(raw.mjd),
    azimuth: new Quantity(raw.azimuthDeg, 'Degree'),
    kind: raw.kind,
  };
}

function mapPeriod(raw) {
  return new Period(
    new ModifiedJulianDate(raw.startMjd),
    new ModifiedJulianDate(raw.endMjd),
  );
}

function mapPhase(raw) {
  return {
    phaseAngle: new Quantity(raw.phaseAngleDeg, 'Degree'),
    illuminatedFraction: raw.illuminatedFraction,
    elongation: new Quantity(raw.elongationDeg, 'Degree'),
    waxing: raw.waxing,
    label: raw.label,
  };
}

function mapPhaseEvent(raw) {
  return {
    mjd: new ModifiedJulianDate(raw.mjd),
    kind: raw.kind,
  };
}

function mapPeriods(periods) {
  return periods.map(mapPeriod);
}

function mapCrossings(events) {
  return events.map(mapCrossingEvent);
}

function mapCulminations(events) {
  return events.map(mapCulminationEvent);
}

function mapAzimuthExtrema(events) {
  return events.map(mapAzimuthExtremum);
}

export function transformDirection(polar, azimuth, srcFrame, dstFrame, jd) {
  return mapDirection(
    backend.transformDirection(
      toAngleValue(polar, 'polar'),
      toAngleValue(azimuth, 'azimuth'),
      srcFrame,
      dstFrame,
      toJdValue(jd),
    ),
  );
}

export function directionToHorizontal(polar, azimuth, srcFrame, jd, observer) {
  return mapDirection(
    backend.directionToHorizontal(
      toAngleValue(polar, 'polar'),
      toAngleValue(azimuth, 'azimuth'),
      srcFrame,
      toJdValue(jd),
      toNativeObserver(observer),
    ),
  );
}

export function geodeticToEcef(observer) {
  return mapCartesianEcef(backend.geodeticToEcef(toNativeObserver(observer)));
}

export function angularSeparation(polar1, azimuth1, polar2, azimuth2, frame) {
  return new Quantity(
    backend.angularSeparation(
      toAngleValue(polar1, 'polar1'),
      toAngleValue(azimuth1, 'azimuth1'),
      toAngleValue(polar2, 'polar2'),
      toAngleValue(azimuth2, 'azimuth2'),
      frame,
    ),
    'Degree',
  );
}

export function cartesianDistance(x1, y1, z1, x2, y2, z2) {
  const lhs = toLengthTriple(x1, y1, z1, 'point1');
  const rhs = {
    x: toQuantity(x2, lhs.unit, 'point2.x').value,
    y: toQuantity(y2, lhs.unit, 'point2.y').value,
    z: toQuantity(z2, lhs.unit, 'point2.z').value,
  };
  return new Quantity(
    backend.cartesianDistance(lhs.x, lhs.y, lhs.z, rhs.x, rhs.y, rhs.z),
    lhs.unit,
  );
}

export function cartesianMagnitude(x, y, z) {
  const vector = toLengthTriple(x, y, z, 'vector');
  return new Quantity(
    backend.cartesianMagnitude(vector.x, vector.y, vector.z),
    vector.unit,
  );
}

export function dotProduct(x1, y1, z1, x2, y2, z2) {
  return backend.dotProduct(x1, y1, z1, x2, y2, z2);
}

export function directionToCartesian(polar, azimuth) {
  return backend.directionToCartesian(
    toAngleValue(polar, 'polar'),
    toAngleValue(azimuth, 'azimuth'),
  );
}

export function vsop87Heliocentric(body, jd) {
  return mapCartesianPosition(backend.vsop87Heliocentric(body, toJdValue(jd)), 'AstronomicalUnit');
}

export function vsop87Barycentric(body, jd) {
  return mapCartesianPosition(backend.vsop87Barycentric(body, toJdValue(jd)), 'AstronomicalUnit');
}

export function vsop87SunBarycentric(jd) {
  return mapCartesianPosition(backend.vsop87SunBarycentric(toJdValue(jd)), 'AstronomicalUnit');
}

export function vsop87EarthBarycentric(jd) {
  return mapCartesianPosition(backend.vsop87EarthBarycentric(toJdValue(jd)), 'AstronomicalUnit');
}

export function vsop87EarthHeliocentric(jd) {
  return mapCartesianPosition(backend.vsop87EarthHeliocentric(toJdValue(jd)), 'AstronomicalUnit');
}

export function vsop87MoonGeocentric(jd) {
  return mapCartesianPosition(backend.vsop87MoonGeocentric(toJdValue(jd)), 'Kilometer');
}

export function transformPositionCenter(x, y, z, srcCenter, dstCenter, jd) {
  const coords = toLengthTriple(x, y, z, 'position');
  return mapCartesianPosition(
    backend.transformPositionCenter(coords.x, coords.y, coords.z, srcCenter, dstCenter, toJdValue(jd)),
    coords.unit,
  );
}

export function transformPositionFrame(x, y, z, srcFrame, dstFrame, jd) {
  const coords = toLengthTriple(x, y, z, 'position');
  return mapCartesianPosition(
    backend.transformPositionFrame(coords.x, coords.y, coords.z, srcFrame, dstFrame, toJdValue(jd)),
    coords.unit,
  );
}

export function orbitalPeriod(name) {
  return new Quantity(backend.orbitalPeriodDays(name), 'Day');
}

export function bodyAltitudeAt(body, observer, mjd) {
  return new Quantity(
    backend.bodyAltitudeAt(body, toNativeObserver(observer), toMjdValue(mjd)),
    'Degree',
  );
}

export function bodyAzimuthAt(body, observer, mjd) {
  return new Quantity(
    backend.bodyAzimuthAt(body, toNativeObserver(observer), toMjdValue(mjd)),
    'Degree',
  );
}

export function bodyCrossings(body, observer, window, threshold) {
  const range = toWindow(window);
  return mapCrossings(
    backend.bodyCrossings(
      body,
      toNativeObserver(observer),
      range.start,
      range.end,
      toAngleValue(threshold, 'threshold'),
    ),
  );
}

export function bodyCulminations(body, observer, window) {
  const range = toWindow(window);
  return mapCulminations(
    backend.bodyCulminations(body, toNativeObserver(observer), range.start, range.end),
  );
}

export function bodyAboveThreshold(body, observer, window, threshold) {
  const range = toWindow(window);
  return mapPeriods(
    backend.bodyAboveThreshold(
      body,
      toNativeObserver(observer),
      range.start,
      range.end,
      toAngleValue(threshold, 'threshold'),
    ),
  );
}

export function bodyBelowThreshold(body, observer, window, threshold) {
  const range = toWindow(window);
  return mapPeriods(
    backend.bodyBelowThreshold(
      body,
      toNativeObserver(observer),
      range.start,
      range.end,
      toAngleValue(threshold, 'threshold'),
    ),
  );
}

export function bodyAzimuthCrossings(body, observer, window, bearing) {
  const range = toWindow(window);
  return mapCrossings(
    backend.bodyAzimuthCrossings(
      body,
      toNativeObserver(observer),
      range.start,
      range.end,
      toAngleValue(bearing, 'bearing'),
    ),
  );
}

export function bodyAzimuthExtrema(body, observer, window) {
  const range = toWindow(window);
  return mapAzimuthExtrema(
    backend.bodyAzimuthExtrema(body, toNativeObserver(observer), range.start, range.end),
  );
}

export function starAltitudeAt(star, observer, mjd) {
  return new Quantity(
    backend.starAltitudeAt(toNativeStar(star), toNativeObserver(observer), toMjdValue(mjd)),
    'Degree',
  );
}

export function starAzimuthAt(star, observer, mjd) {
  return new Quantity(
    backend.starAzimuthAt(toNativeStar(star), toNativeObserver(observer), toMjdValue(mjd)),
    'Degree',
  );
}

export function starCrossings(star, observer, window, threshold) {
  const range = toWindow(window);
  return mapCrossings(
    backend.starCrossings(
      toNativeStar(star),
      toNativeObserver(observer),
      range.start,
      range.end,
      toAngleValue(threshold, 'threshold'),
    ),
  );
}

export function starCulminations(star, observer, window) {
  const range = toWindow(window);
  return mapCulminations(
    backend.starCulminations(toNativeStar(star), toNativeObserver(observer), range.start, range.end),
  );
}

export function starAboveThreshold(star, observer, window, threshold) {
  const range = toWindow(window);
  return mapPeriods(
    backend.starAboveThreshold(
      toNativeStar(star),
      toNativeObserver(observer),
      range.start,
      range.end,
      toAngleValue(threshold, 'threshold'),
    ),
  );
}

export function starBelowThreshold(star, observer, window, threshold) {
  const range = toWindow(window);
  return mapPeriods(
    backend.starBelowThreshold(
      toNativeStar(star),
      toNativeObserver(observer),
      range.start,
      range.end,
      toAngleValue(threshold, 'threshold'),
    ),
  );
}

export function starAzimuthCrossings(star, observer, window, bearing) {
  const range = toWindow(window);
  return mapCrossings(
    backend.starAzimuthCrossings(
      toNativeStar(star),
      toNativeObserver(observer),
      range.start,
      range.end,
      toAngleValue(bearing, 'bearing'),
    ),
  );
}

export function starAzimuthExtrema(star, observer, window) {
  const range = toWindow(window);
  return mapAzimuthExtrema(
    backend.starAzimuthExtrema(toNativeStar(star), toNativeObserver(observer), range.start, range.end),
  );
}

export function intersectPeriods(periods1, periods2) {
  const rawPeriods1 = periods1.map((period) => {
    const range = toWindow(period);
    return { startMjd: range.start, endMjd: range.end };
  });
  const rawPeriods2 = periods2.map((period) => {
    const range = toWindow(period);
    return { startMjd: range.start, endMjd: range.end };
  });
  return mapPeriods(backend.intersectPeriods(rawPeriods1, rawPeriods2));
}

export function moonPhase(jd) {
  return mapPhase(backend.moonPhase(toJdValue(jd)));
}

export function moonPhaseTopocentric(jd, observer) {
  return mapPhase(backend.moonPhaseTopocentric(toJdValue(jd), toNativeObserver(observer)));
}

export function findPhaseEvents(window) {
  const range = toWindow(window);
  return backend.findPhaseEvents(range.start, range.end).map(mapPhaseEvent);
}

export function moonIlluminationAbove(window, kMin) {
  const range = toWindow(window);
  return mapPeriods(backend.moonIlluminationAbove(range.start, range.end, kMin));
}

export function moonIlluminationBelow(window, kMax) {
  const range = toWindow(window);
  return mapPeriods(backend.moonIlluminationBelow(range.start, range.end, kMax));
}

export function moonIlluminationRange(window, kMin, kMax) {
  const range = toWindow(window);
  return mapPeriods(backend.moonIlluminationRange(range.start, range.end, kMin, kMax));
}

export function getPlanet(name) {
  return mapPlanetInfo(backend.getPlanet(name));
}

export const listBodies = backend.listBodies;
export const listCatalogStars = backend.listCatalogStars;
export const version = backend.version;
