/**
 * @siderust/siderust-web — High-precision astronomy for the browser.
 *
 * Call `init()` (and `await` it) before using any other export.
 *
 * @module @siderust/siderust-web
 */

export { init } from './lib/backend.js';
export { Observer } from './lib/Observer.js';
export { Star } from './lib/Star.js';

export {
  // Bodies / Stars
  getPlanet,
  listBodies,
  listCatalogStars,
  // Coordinates
  transformDirection,
  directionToHorizontal,
  geodeticToEcef,
  angularSeparation,
  cartesianDistance,
  cartesianMagnitude,
  dotProduct,
  directionToCartesian,
  // Ephemeris
  vsop87Heliocentric,
  vsop87Barycentric,
  vsop87SunBarycentric,
  vsop87EarthBarycentric,
  vsop87EarthHeliocentric,
  vsop87MoonGeocentric,
  transformPositionCenter,
  transformPositionFrame,
  orbitalPeriodDays,
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
  intersectPeriods,
  // Moon
  moonPhase,
  moonPhaseTopocentric,
  findPhaseEvents,
  moonIlluminationAbove,
  moonIlluminationBelow,
  moonIlluminationRange,
  // Meta
  version,
} from './lib/wrappers.js';
