/**
 * @siderust/siderust — Internal native backend wrapper.
 *
 * Loads the NAPI-RS `.node` addon and re-exports the raw primitives
 * that the public JS façade classes and free functions need.
 *
 * @module @siderust/siderust/lib/backend
 * @private
 */

'use strict';

const native = require('../native.cjs');

// ── Native classes (internal only) ────────────────────────────────
module.exports.NativeObserver = native.Observer;
module.exports.NativeStar = native.Star;

// ── Free functions (pass-through) ─────────────────────────────────
module.exports.getPlanet = native.getPlanet;
module.exports.listBodies = native.listBodies;
module.exports.transformDirection = native.transformDirection;
module.exports.directionToHorizontal = native.directionToHorizontal;
module.exports.geodeticToEcef = native.geodeticToEcef;
module.exports.angularSeparation = native.angularSeparation;
module.exports.cartesianDistance = native.cartesianDistance;
module.exports.cartesianMagnitude = native.cartesianMagnitude;
module.exports.dotProduct = native.dotProduct;
module.exports.directionToCartesian = native.directionToCartesian;
module.exports.vsop87Heliocentric = native.vsop87Heliocentric;
module.exports.vsop87Barycentric = native.vsop87Barycentric;
module.exports.vsop87SunBarycentric = native.vsop87SunBarycentric;
module.exports.vsop87EarthBarycentric = native.vsop87EarthBarycentric;
module.exports.vsop87EarthHeliocentric = native.vsop87EarthHeliocentric;
module.exports.vsop87MoonGeocentric = native.vsop87MoonGeocentric;
module.exports.transformPositionCenter = native.transformPositionCenter;
module.exports.transformPositionFrame = native.transformPositionFrame;
module.exports.orbitalPeriodDays = native.orbitalPeriodDays;
module.exports.bodyAltitudeAt = native.bodyAltitudeAt;
module.exports.bodyAzimuthAt = native.bodyAzimuthAt;
module.exports.bodyCrossings = native.bodyCrossings;
module.exports.bodyCulminations = native.bodyCulminations;
module.exports.bodyAboveThreshold = native.bodyAboveThreshold;
module.exports.bodyBelowThreshold = native.bodyBelowThreshold;
module.exports.bodyAzimuthCrossings = native.bodyAzimuthCrossings;
module.exports.bodyAzimuthExtrema = native.bodyAzimuthExtrema;
module.exports.starAltitudeAt = native.starAltitudeAt;
module.exports.starAzimuthAt = native.starAzimuthAt;
module.exports.starCrossings = native.starCrossings;
module.exports.starCulminations = native.starCulminations;
module.exports.starAboveThreshold = native.starAboveThreshold;
module.exports.starBelowThreshold = native.starBelowThreshold;
module.exports.starAzimuthCrossings = native.starAzimuthCrossings;
module.exports.starAzimuthExtrema = native.starAzimuthExtrema;
module.exports.intersectPeriods = native.intersectPeriods;
module.exports.moonPhase = native.moonPhase;
module.exports.moonPhaseTopocentric = native.moonPhaseTopocentric;
module.exports.findPhaseEvents = native.findPhaseEvents;
module.exports.moonIlluminationAbove = native.moonIlluminationAbove;
module.exports.moonIlluminationBelow = native.moonIlluminationBelow;
module.exports.moonIlluminationRange = native.moonIlluminationRange;
module.exports.listCatalogStars = native.listCatalogStars;
module.exports.version = native.version;
