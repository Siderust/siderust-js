/**
 * @siderust/siderust — High-precision astronomy for Node.js.
 *
 * Public entrypoint.  Exposes JS-level façade classes (`Observer`,
 * `Star`) and wrapped free functions from the native backend.
 *
 * @module @siderust/siderust
 */

'use strict';

const { Observer } = require('./lib/Observer.js');
const { Star } = require('./lib/Star.js');
const wrappers = require('./lib/wrappers.js');

// ── Classes ───────────────────────────────────────────────────────
module.exports.Observer = Observer;
module.exports.Star = Star;

// ── Bodies / Stars ────────────────────────────────────────────────
module.exports.getPlanet = wrappers.getPlanet;
module.exports.listBodies = wrappers.listBodies;
module.exports.listCatalogStars = wrappers.listCatalogStars;

// ── Coordinates ───────────────────────────────────────────────────
module.exports.transformDirection = wrappers.transformDirection;
module.exports.directionToHorizontal = wrappers.directionToHorizontal;
module.exports.geodeticToEcef = wrappers.geodeticToEcef;
module.exports.angularSeparation = wrappers.angularSeparation;
module.exports.cartesianDistance = wrappers.cartesianDistance;
module.exports.cartesianMagnitude = wrappers.cartesianMagnitude;
module.exports.dotProduct = wrappers.dotProduct;
module.exports.directionToCartesian = wrappers.directionToCartesian;

// ── Ephemeris ─────────────────────────────────────────────────────
module.exports.vsop87Heliocentric = wrappers.vsop87Heliocentric;
module.exports.vsop87Barycentric = wrappers.vsop87Barycentric;
module.exports.vsop87SunBarycentric = wrappers.vsop87SunBarycentric;
module.exports.vsop87EarthBarycentric = wrappers.vsop87EarthBarycentric;
module.exports.vsop87EarthHeliocentric = wrappers.vsop87EarthHeliocentric;
module.exports.vsop87MoonGeocentric = wrappers.vsop87MoonGeocentric;
module.exports.transformPositionCenter = wrappers.transformPositionCenter;
module.exports.transformPositionFrame = wrappers.transformPositionFrame;
module.exports.orbitalPeriodDays = wrappers.orbitalPeriodDays;

// ── Body events ───────────────────────────────────────────────────
module.exports.bodyAltitudeAt = wrappers.bodyAltitudeAt;
module.exports.bodyAzimuthAt = wrappers.bodyAzimuthAt;
module.exports.bodyCrossings = wrappers.bodyCrossings;
module.exports.bodyCulminations = wrappers.bodyCulminations;
module.exports.bodyAboveThreshold = wrappers.bodyAboveThreshold;
module.exports.bodyBelowThreshold = wrappers.bodyBelowThreshold;
module.exports.bodyAzimuthCrossings = wrappers.bodyAzimuthCrossings;
module.exports.bodyAzimuthExtrema = wrappers.bodyAzimuthExtrema;

// ── Star events ───────────────────────────────────────────────────
module.exports.starAltitudeAt = wrappers.starAltitudeAt;
module.exports.starAzimuthAt = wrappers.starAzimuthAt;
module.exports.starCrossings = wrappers.starCrossings;
module.exports.starCulminations = wrappers.starCulminations;
module.exports.starAboveThreshold = wrappers.starAboveThreshold;
module.exports.starBelowThreshold = wrappers.starBelowThreshold;
module.exports.starAzimuthCrossings = wrappers.starAzimuthCrossings;
module.exports.starAzimuthExtrema = wrappers.starAzimuthExtrema;

// ── Periods ───────────────────────────────────────────────────────
module.exports.intersectPeriods = wrappers.intersectPeriods;

// ── Moon ──────────────────────────────────────────────────────────
module.exports.moonPhase = wrappers.moonPhase;
module.exports.moonPhaseTopocentric = wrappers.moonPhaseTopocentric;
module.exports.findPhaseEvents = wrappers.findPhaseEvents;
module.exports.moonIlluminationAbove = wrappers.moonIlluminationAbove;
module.exports.moonIlluminationBelow = wrappers.moonIlluminationBelow;
module.exports.moonIlluminationRange = wrappers.moonIlluminationRange;

// ── Meta ──────────────────────────────────────────────────────────
module.exports.version = wrappers.version;


