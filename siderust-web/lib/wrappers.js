/**
 * @siderust/siderust-web — Typed wrapper functions.
 *
 * These wrappers accept the JS façade `Observer` and `Star` objects
 * and internally construct native WASM observers/stars for backend calls.
 * They also accept `ModifiedJulianDate`/`JulianDate` for time parameters.
 *
 * @module @siderust/siderust-web/lib/wrappers
 * @private
 */

import * as backend from './backend.js';

// ─────────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────────

function toNativeObserver(obs) {
  return backend.NativeObserver(obs._lonDeg, obs._latDeg, obs._heightM);
}

function toNativeStar(star) {
  return backend.NativeStar(
    star._name,
    star._distanceLy,
    star._massSolar,
    star._radiusSolar,
    star._luminositySolar,
    star._raDeg,
    star._decDeg,
  );
}

function toMjdValue(mjd) {
  if (typeof mjd === 'number') return mjd;
  if (mjd && typeof mjd.value === 'number') return mjd.value;
  throw new Error('Expected a ModifiedJulianDate or number');
}

function toJdValue(jd) {
  if (typeof jd === 'number') return jd;
  if (jd && typeof jd.value === 'number') return jd.value;
  throw new Error('Expected a JulianDate or number');
}

// ─────────────────────────────────────────────────────────────────────────
// Direction / coordinate wrappers
// ─────────────────────────────────────────────────────────────────────────

export function transformDirection(polarDeg, azimuthDeg, srcFrame, dstFrame, jd) {
  return backend.transformDirection(polarDeg, azimuthDeg, srcFrame, dstFrame, toJdValue(jd));
}

export function directionToHorizontal(polarDeg, azimuthDeg, srcFrame, jd, observer) {
  return backend.directionToHorizontal(polarDeg, azimuthDeg, srcFrame, toJdValue(jd), toNativeObserver(observer));
}

export function geodeticToEcef(observer) {
  return backend.geodeticToEcef(toNativeObserver(observer));
}

export { angularSeparation, cartesianDistance, cartesianMagnitude, dotProduct, directionToCartesian } from './backend.js';

// ─────────────────────────────────────────────────────────────────────────
// Ephemeris wrappers (accept JulianDate | number)
// ─────────────────────────────────────────────────────────────────────────

export function vsop87Heliocentric(body, jd) {
  return backend.vsop87Heliocentric(body, toJdValue(jd));
}

export function vsop87Barycentric(body, jd) {
  return backend.vsop87Barycentric(body, toJdValue(jd));
}

export function vsop87SunBarycentric(jd) {
  return backend.vsop87SunBarycentric(toJdValue(jd));
}

export function vsop87EarthBarycentric(jd) {
  return backend.vsop87EarthBarycentric(toJdValue(jd));
}

export function vsop87EarthHeliocentric(jd) {
  return backend.vsop87EarthHeliocentric(toJdValue(jd));
}

export function vsop87MoonGeocentric(jd) {
  return backend.vsop87MoonGeocentric(toJdValue(jd));
}

export function transformPositionCenter(x, y, z, srcCenter, dstCenter, jd) {
  return backend.transformPositionCenter(x, y, z, srcCenter, dstCenter, toJdValue(jd));
}

export function transformPositionFrame(x, y, z, srcFrame, dstFrame, jd) {
  return backend.transformPositionFrame(x, y, z, srcFrame, dstFrame, toJdValue(jd));
}

export { orbitalPeriodDays } from './backend.js';

// ─────────────────────────────────────────────────────────────────────────
// Body event wrappers (accept MJD objects | number for time params)
// ─────────────────────────────────────────────────────────────────────────

export function bodyAltitudeAt(body, observer, mjd) {
  return backend.bodyAltitudeAt(body, toNativeObserver(observer), toMjdValue(mjd));
}

export function bodyAzimuthAt(body, observer, mjd) {
  return backend.bodyAzimuthAt(body, toNativeObserver(observer), toMjdValue(mjd));
}

export function bodyCrossings(body, observer, startMjd, endMjd, thresholdDeg) {
  return backend.bodyCrossings(body, toNativeObserver(observer), toMjdValue(startMjd), toMjdValue(endMjd), thresholdDeg);
}

export function bodyCulminations(body, observer, startMjd, endMjd) {
  return backend.bodyCulminations(body, toNativeObserver(observer), toMjdValue(startMjd), toMjdValue(endMjd));
}

export function bodyAboveThreshold(body, observer, startMjd, endMjd, thresholdDeg) {
  return backend.bodyAboveThreshold(body, toNativeObserver(observer), toMjdValue(startMjd), toMjdValue(endMjd), thresholdDeg);
}

export function bodyBelowThreshold(body, observer, startMjd, endMjd, thresholdDeg) {
  return backend.bodyBelowThreshold(body, toNativeObserver(observer), toMjdValue(startMjd), toMjdValue(endMjd), thresholdDeg);
}

export function bodyAzimuthCrossings(body, observer, startMjd, endMjd, bearingDeg) {
  return backend.bodyAzimuthCrossings(body, toNativeObserver(observer), toMjdValue(startMjd), toMjdValue(endMjd), bearingDeg);
}

export function bodyAzimuthExtrema(body, observer, startMjd, endMjd) {
  return backend.bodyAzimuthExtrema(body, toNativeObserver(observer), toMjdValue(startMjd), toMjdValue(endMjd));
}

// ─────────────────────────────────────────────────────────────────────────
// Star event wrappers
// ─────────────────────────────────────────────────────────────────────────

export function starAltitudeAt(star, observer, mjd) {
  return backend.starAltitudeAt(toNativeStar(star), toNativeObserver(observer), toMjdValue(mjd));
}

export function starAzimuthAt(star, observer, mjd) {
  return backend.starAzimuthAt(toNativeStar(star), toNativeObserver(observer), toMjdValue(mjd));
}

export function starCrossings(star, observer, startMjd, endMjd, thresholdDeg) {
  return backend.starCrossings(toNativeStar(star), toNativeObserver(observer), toMjdValue(startMjd), toMjdValue(endMjd), thresholdDeg);
}

export function starCulminations(star, observer, startMjd, endMjd) {
  return backend.starCulminations(toNativeStar(star), toNativeObserver(observer), toMjdValue(startMjd), toMjdValue(endMjd));
}

export function starAboveThreshold(star, observer, startMjd, endMjd, thresholdDeg) {
  return backend.starAboveThreshold(toNativeStar(star), toNativeObserver(observer), toMjdValue(startMjd), toMjdValue(endMjd), thresholdDeg);
}

export function starBelowThreshold(star, observer, startMjd, endMjd, thresholdDeg) {
  return backend.starBelowThreshold(toNativeStar(star), toNativeObserver(observer), toMjdValue(startMjd), toMjdValue(endMjd), thresholdDeg);
}

export function starAzimuthCrossings(star, observer, startMjd, endMjd, bearingDeg) {
  return backend.starAzimuthCrossings(toNativeStar(star), toNativeObserver(observer), toMjdValue(startMjd), toMjdValue(endMjd), bearingDeg);
}

export function starAzimuthExtrema(star, observer, startMjd, endMjd) {
  return backend.starAzimuthExtrema(toNativeStar(star), toNativeObserver(observer), toMjdValue(startMjd), toMjdValue(endMjd));
}

// ─────────────────────────────────────────────────────────────────────────
// Periods
// ─────────────────────────────────────────────────────────────────────────

export { intersectPeriods } from './backend.js';

// ─────────────────────────────────────────────────────────────────────────
// Moon phase wrappers
// ─────────────────────────────────────────────────────────────────────────

export function moonPhase(jd) {
  return backend.moonPhase(toJdValue(jd));
}

export function moonPhaseTopocentric(jd, observer) {
  return backend.moonPhaseTopocentric(toJdValue(jd), toNativeObserver(observer));
}

export function findPhaseEvents(startMjd, endMjd) {
  return backend.findPhaseEvents(toMjdValue(startMjd), toMjdValue(endMjd));
}

export function moonIlluminationAbove(startMjd, endMjd, kMin) {
  return backend.moonIlluminationAbove(toMjdValue(startMjd), toMjdValue(endMjd), kMin);
}

export function moonIlluminationBelow(startMjd, endMjd, kMax) {
  return backend.moonIlluminationBelow(toMjdValue(startMjd), toMjdValue(endMjd), kMax);
}

export function moonIlluminationRange(startMjd, endMjd, kMin, kMax) {
  return backend.moonIlluminationRange(toMjdValue(startMjd), toMjdValue(endMjd), kMin, kMax);
}

// ─────────────────────────────────────────────────────────────────────────
// Bodies / stars / meta
// ─────────────────────────────────────────────────────────────────────────

export { getPlanet, listBodies, listCatalogStars, version } from './backend.js';
