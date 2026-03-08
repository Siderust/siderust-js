/**
 * @siderust/siderust — Typed wrapper functions.
 *
 * These wrappers accept the JS façade `Observer` and `Star` objects
 * and internally construct native observers/stars for the backend calls.
 * They also accept `ModifiedJulianDate`/`JulianDate` for time parameters
 * and return typed objects where appropriate.
 *
 * @module @siderust/siderust/lib/wrappers
 * @private
 */

'use strict';

const backend = require('./backend.js');

// ─────────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────────

/**
 * Create a native Observer from a façade Observer.
 * @param {import('./Observer.js').Observer} obs
 * @returns {native.Observer}
 */
function toNativeObserver(obs) {
  return new backend.NativeObserver(obs._lonDeg, obs._latDeg, obs._heightM);
}

/**
 * Create a native Star from a façade Star.
 * @param {import('./Star.js').Star} star
 * @returns {native.Star}
 */
function toNativeStar(star) {
  return new backend.NativeStar(
    star._name,
    star._distanceLy,
    star._massSolar,
    star._radiusSolar,
    star._luminositySolar,
    star._raDeg,
    star._decDeg,
  );
}

/**
 * Extract MJD value from a ModifiedJulianDate object or raw number.
 * @param {number | { _value: number, value: number }} mjd
 * @returns {number}
 */
function toMjdValue(mjd) {
  if (typeof mjd === 'number') return mjd;
  if (mjd && typeof mjd.value === 'number') return mjd.value;
  throw new Error('Expected a ModifiedJulianDate or number');
}

/**
 * Extract JD value from a JulianDate object or raw number.
 * @param {number | { _value: number, value: number }} jd
 * @returns {number}
 */
function toJdValue(jd) {
  if (typeof jd === 'number') return jd;
  if (jd && typeof jd.value === 'number') return jd.value;
  throw new Error('Expected a JulianDate or number');
}

// ─────────────────────────────────────────────────────────────────────────
// Direction / coordinate wrappers
// ─────────────────────────────────────────────────────────────────────────

function directionToHorizontal(polarDeg, azimuthDeg, srcFrame, jd, observer) {
  return backend.directionToHorizontal(polarDeg, azimuthDeg, srcFrame, toJdValue(jd), toNativeObserver(observer));
}

function geodeticToEcef(observer) {
  return backend.geodeticToEcef(toNativeObserver(observer));
}

// ─────────────────────────────────────────────────────────────────────────
// Ephemeris wrappers (accept JulianDate | number)
// ─────────────────────────────────────────────────────────────────────────

function vsop87Heliocentric(body, jd) {
  return backend.vsop87Heliocentric(body, toJdValue(jd));
}

function vsop87Barycentric(body, jd) {
  return backend.vsop87Barycentric(body, toJdValue(jd));
}

function vsop87SunBarycentric(jd) {
  return backend.vsop87SunBarycentric(toJdValue(jd));
}

function vsop87EarthBarycentric(jd) {
  return backend.vsop87EarthBarycentric(toJdValue(jd));
}

function vsop87EarthHeliocentric(jd) {
  return backend.vsop87EarthHeliocentric(toJdValue(jd));
}

function vsop87MoonGeocentric(jd) {
  return backend.vsop87MoonGeocentric(toJdValue(jd));
}

function transformPositionCenter(x, y, z, srcCenter, dstCenter, jd) {
  return backend.transformPositionCenter(x, y, z, srcCenter, dstCenter, toJdValue(jd));
}

function transformPositionFrame(x, y, z, srcFrame, dstFrame, jd) {
  return backend.transformPositionFrame(x, y, z, srcFrame, dstFrame, toJdValue(jd));
}

function transformDirection(polarDeg, azimuthDeg, srcFrame, dstFrame, jd) {
  return backend.transformDirection(polarDeg, azimuthDeg, srcFrame, dstFrame, toJdValue(jd));
}

// ─────────────────────────────────────────────────────────────────────────
// Body event wrappers (accept MJD objects | number for time params)
// ─────────────────────────────────────────────────────────────────────────

function bodyAltitudeAt(body, observer, mjd) {
  return backend.bodyAltitudeAt(body, toNativeObserver(observer), toMjdValue(mjd));
}

function bodyAzimuthAt(body, observer, mjd) {
  return backend.bodyAzimuthAt(body, toNativeObserver(observer), toMjdValue(mjd));
}

function bodyCrossings(body, observer, startMjd, endMjd, thresholdDeg) {
  return backend.bodyCrossings(body, toNativeObserver(observer), toMjdValue(startMjd), toMjdValue(endMjd), thresholdDeg);
}

function bodyCulminations(body, observer, startMjd, endMjd) {
  return backend.bodyCulminations(body, toNativeObserver(observer), toMjdValue(startMjd), toMjdValue(endMjd));
}

function bodyAboveThreshold(body, observer, startMjd, endMjd, thresholdDeg) {
  return backend.bodyAboveThreshold(body, toNativeObserver(observer), toMjdValue(startMjd), toMjdValue(endMjd), thresholdDeg);
}

function bodyBelowThreshold(body, observer, startMjd, endMjd, thresholdDeg) {
  return backend.bodyBelowThreshold(body, toNativeObserver(observer), toMjdValue(startMjd), toMjdValue(endMjd), thresholdDeg);
}

function bodyAzimuthCrossings(body, observer, startMjd, endMjd, bearingDeg) {
  return backend.bodyAzimuthCrossings(body, toNativeObserver(observer), toMjdValue(startMjd), toMjdValue(endMjd), bearingDeg);
}

function bodyAzimuthExtrema(body, observer, startMjd, endMjd) {
  return backend.bodyAzimuthExtrema(body, toNativeObserver(observer), toMjdValue(startMjd), toMjdValue(endMjd));
}

// ─────────────────────────────────────────────────────────────────────────
// Star event wrappers
// ─────────────────────────────────────────────────────────────────────────

function starAltitudeAt(star, observer, mjd) {
  return backend.starAltitudeAt(toNativeStar(star), toNativeObserver(observer), toMjdValue(mjd));
}

function starAzimuthAt(star, observer, mjd) {
  return backend.starAzimuthAt(toNativeStar(star), toNativeObserver(observer), toMjdValue(mjd));
}

function starCrossings(star, observer, startMjd, endMjd, thresholdDeg) {
  return backend.starCrossings(toNativeStar(star), toNativeObserver(observer), toMjdValue(startMjd), toMjdValue(endMjd), thresholdDeg);
}

function starCulminations(star, observer, startMjd, endMjd) {
  return backend.starCulminations(toNativeStar(star), toNativeObserver(observer), toMjdValue(startMjd), toMjdValue(endMjd));
}

function starAboveThreshold(star, observer, startMjd, endMjd, thresholdDeg) {
  return backend.starAboveThreshold(toNativeStar(star), toNativeObserver(observer), toMjdValue(startMjd), toMjdValue(endMjd), thresholdDeg);
}

function starBelowThreshold(star, observer, startMjd, endMjd, thresholdDeg) {
  return backend.starBelowThreshold(toNativeStar(star), toNativeObserver(observer), toMjdValue(startMjd), toMjdValue(endMjd), thresholdDeg);
}

function starAzimuthCrossings(star, observer, startMjd, endMjd, bearingDeg) {
  return backend.starAzimuthCrossings(toNativeStar(star), toNativeObserver(observer), toMjdValue(startMjd), toMjdValue(endMjd), bearingDeg);
}

function starAzimuthExtrema(star, observer, startMjd, endMjd) {
  return backend.starAzimuthExtrema(toNativeStar(star), toNativeObserver(observer), toMjdValue(startMjd), toMjdValue(endMjd));
}

// ─────────────────────────────────────────────────────────────────────────
// Moon phase wrappers
// ─────────────────────────────────────────────────────────────────────────

function moonPhase(jd) {
  return backend.moonPhase(toJdValue(jd));
}

function moonPhaseTopocentric(jd, observer) {
  return backend.moonPhaseTopocentric(toJdValue(jd), toNativeObserver(observer));
}

function findPhaseEvents(startMjd, endMjd) {
  return backend.findPhaseEvents(toMjdValue(startMjd), toMjdValue(endMjd));
}

function moonIlluminationAbove(startMjd, endMjd, kMin) {
  return backend.moonIlluminationAbove(toMjdValue(startMjd), toMjdValue(endMjd), kMin);
}

function moonIlluminationBelow(startMjd, endMjd, kMax) {
  return backend.moonIlluminationBelow(toMjdValue(startMjd), toMjdValue(endMjd), kMax);
}

function moonIlluminationRange(startMjd, endMjd, kMin, kMax) {
  return backend.moonIlluminationRange(toMjdValue(startMjd), toMjdValue(endMjd), kMin, kMax);
}

// ─────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────

module.exports = {
  // Coordinates
  transformDirection,
  directionToHorizontal,
  geodeticToEcef,
  angularSeparation: backend.angularSeparation,
  cartesianDistance: backend.cartesianDistance,
  cartesianMagnitude: backend.cartesianMagnitude,
  dotProduct: backend.dotProduct,
  directionToCartesian: backend.directionToCartesian,
  // Ephemeris
  vsop87Heliocentric,
  vsop87Barycentric,
  vsop87SunBarycentric,
  vsop87EarthBarycentric,
  vsop87EarthHeliocentric,
  vsop87MoonGeocentric,
  transformPositionCenter,
  transformPositionFrame,
  orbitalPeriodDays: backend.orbitalPeriodDays,
  // Body events
  bodyAltitudeAt,
  bodyAzimuthAt,
  bodyCrossings,
  bodyCulminations,
  bodyAboveThreshold,
  bodyBelowThreshold,
  bodyAzimuthCrossings,
  bodyAzimuthExtrema,
  // Star events
  starAltitudeAt,
  starAzimuthAt,
  starCrossings,
  starCulminations,
  starAboveThreshold,
  starBelowThreshold,
  starAzimuthCrossings,
  starAzimuthExtrema,
  // Periods
  intersectPeriods: backend.intersectPeriods,
  // Moon
  moonPhase,
  moonPhaseTopocentric,
  findPhaseEvents,
  moonIlluminationAbove,
  moonIlluminationBelow,
  moonIlluminationRange,
  // Bodies / stars
  getPlanet: backend.getPlanet,
  listBodies: backend.listBodies,
  listCatalogStars: backend.listCatalogStars,
  // Meta
  version: backend.version,
};
