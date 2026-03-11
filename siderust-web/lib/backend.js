/**
 * @siderust/siderust-web — Internal WASM backend abstraction.
 *
 * Loads the wasm-bindgen generated module and re-exports the native
 * WASM classes and free functions that the JS façade layer needs.
 *
 * @module @siderust/siderust-web/lib/backend
 * @private
 */

import { init as initQtty, unitDimension } from "@siderust/qtty-web";
import {
  init as initTempoch,
  version as tempochVersion,
} from "@siderust/tempoch-web";

let wasm = null;

/**
 * Initialise the WASM module.  Must be called before any other function.
 * @param {RequestInfo | URL | Response | BufferSource | WebAssembly.Module} [module_or_path]
 */
export async function init(module_or_path) {
  if (!_qttyReady()) {
    await initQtty();
  }
  if (!_tempochReady()) {
    await initTempoch();
  }
  const mod = await import("../pkg/siderust_web.js");
  await mod.default(module_or_path);
  wasm = mod;
}

function _qttyReady() {
  try {
    unitDimension("Meter");
    return true;
  } catch {
    return false;
  }
}

function _tempochReady() {
  try {
    tempochVersion();
    return true;
  } catch {
    return false;
  }
}

export function ensureInit() {
  if (!wasm) {
    throw new Error(
      "@siderust/siderust-web: call init() before using any function",
    );
  }
}

// ── Native WASM classes (used internally by wrappers.js) ─────────

export function NativeObserver(lonDeg, latDeg, heightM) {
  ensureInit();
  return new wasm.Observer(lonDeg, latDeg, heightM);
}

/** Access native Observer static presets */
NativeObserver.roqueDeLasMuchachos = () => {
  ensureInit();
  return wasm.Observer.roqueDeLasMuchachos();
};
NativeObserver.elParanal = () => {
  ensureInit();
  return wasm.Observer.elParanal();
};
NativeObserver.maunaKea = () => {
  ensureInit();
  return wasm.Observer.maunaKea();
};
NativeObserver.laSilla = () => {
  ensureInit();
  return wasm.Observer.laSilla();
};

export function NativeStar(
  name,
  distanceLy,
  massSolar,
  radiusSolar,
  luminositySolar,
  raDeg,
  decDeg,
) {
  ensureInit();
  return new wasm.Star(
    name,
    distanceLy,
    massSolar,
    radiusSolar,
    luminositySolar,
    raDeg,
    decDeg,
  );
}

NativeStar.catalog = (name) => {
  ensureInit();
  return wasm.Star.catalog(name);
};

// ── Bodies / Stars ────────────────────────────────────────────────

export function getPlanet(name) {
  ensureInit();
  return wasm.getPlanet(name);
}
export function listBodies() {
  ensureInit();
  return wasm.listBodies();
}
export function listCatalogStars() {
  ensureInit();
  return wasm.listCatalogStars();
}

// ── Coordinates ───────────────────────────────────────────────────

export function transformDirection(
  polarDeg,
  azimuthDeg,
  srcFrame,
  dstFrame,
  jd,
) {
  ensureInit();
  return wasm.transformDirection(polarDeg, azimuthDeg, srcFrame, dstFrame, jd);
}
export function directionToHorizontal(
  polarDeg,
  azimuthDeg,
  srcFrame,
  jd,
  observer,
) {
  ensureInit();
  return wasm.directionToHorizontal(
    polarDeg,
    azimuthDeg,
    srcFrame,
    jd,
    observer,
  );
}
export function geodeticToEcef(observer) {
  ensureInit();
  return wasm.geodeticToEcef(observer);
}
export function angularSeparation(p1, a1, p2, a2, frame) {
  ensureInit();
  return wasm.angularSeparation(p1, a1, p2, a2, frame);
}
export function cartesianDistance(x1, y1, z1, x2, y2, z2) {
  ensureInit();
  return wasm.cartesianDistance(x1, y1, z1, x2, y2, z2);
}
export function cartesianMagnitude(x, y, z) {
  ensureInit();
  return wasm.cartesianMagnitude(x, y, z);
}
export function dotProduct(x1, y1, z1, x2, y2, z2) {
  ensureInit();
  return wasm.dotProduct(x1, y1, z1, x2, y2, z2);
}
export function directionToCartesian(polarDeg, azimuthDeg) {
  ensureInit();
  return wasm.directionToCartesian(polarDeg, azimuthDeg);
}

// ── Ephemeris ─────────────────────────────────────────────────────

export function vsop87Heliocentric(body, jd) {
  ensureInit();
  return wasm.vsop87Heliocentric(body, jd);
}
export function vsop87Barycentric(body, jd) {
  ensureInit();
  return wasm.vsop87Barycentric(body, jd);
}
export function vsop87SunBarycentric(jd) {
  ensureInit();
  return wasm.vsop87SunBarycentric(jd);
}
export function vsop87EarthBarycentric(jd) {
  ensureInit();
  return wasm.vsop87EarthBarycentric(jd);
}
export function vsop87EarthHeliocentric(jd) {
  ensureInit();
  return wasm.vsop87EarthHeliocentric(jd);
}
export function vsop87MoonGeocentric(jd) {
  ensureInit();
  return wasm.vsop87MoonGeocentric(jd);
}
export function transformPositionCenter(x, y, z, srcCenter, dstCenter, jd) {
  ensureInit();
  return wasm.transformPositionCenter(x, y, z, srcCenter, dstCenter, jd);
}
export function transformPositionFrame(x, y, z, srcFrame, dstFrame, jd) {
  ensureInit();
  return wasm.transformPositionFrame(x, y, z, srcFrame, dstFrame, jd);
}
export function orbitalPeriodDays(name) {
  ensureInit();
  return wasm.orbitalPeriodDays(name);
}

// ── Body events ───────────────────────────────────────────────────

export function bodyAltitudeAt(body, observer, mjd) {
  ensureInit();
  return wasm.bodyAltitudeAt(body, observer, mjd);
}
export function bodyAzimuthAt(body, observer, mjd) {
  ensureInit();
  return wasm.bodyAzimuthAt(body, observer, mjd);
}
export function bodyCrossings(body, observer, startMjd, endMjd, thresholdDeg) {
  ensureInit();
  return wasm.bodyCrossings(body, observer, startMjd, endMjd, thresholdDeg);
}
export function bodyCulminations(body, observer, startMjd, endMjd) {
  ensureInit();
  return wasm.bodyCulminations(body, observer, startMjd, endMjd);
}
export function bodyAboveThreshold(
  body,
  observer,
  startMjd,
  endMjd,
  thresholdDeg,
) {
  ensureInit();
  return wasm.bodyAboveThreshold(
    body,
    observer,
    startMjd,
    endMjd,
    thresholdDeg,
  );
}
export function bodyBelowThreshold(
  body,
  observer,
  startMjd,
  endMjd,
  thresholdDeg,
) {
  ensureInit();
  return wasm.bodyBelowThreshold(
    body,
    observer,
    startMjd,
    endMjd,
    thresholdDeg,
  );
}
export function bodyAzimuthCrossings(
  body,
  observer,
  startMjd,
  endMjd,
  bearingDeg,
) {
  ensureInit();
  return wasm.bodyAzimuthCrossings(
    body,
    observer,
    startMjd,
    endMjd,
    bearingDeg,
  );
}
export function bodyAzimuthExtrema(body, observer, startMjd, endMjd) {
  ensureInit();
  return wasm.bodyAzimuthExtrema(body, observer, startMjd, endMjd);
}

// ── Star events ───────────────────────────────────────────────────

export function starAltitudeAt(star, observer, mjd) {
  ensureInit();
  return wasm.starAltitudeAt(star, observer, mjd);
}
export function starAzimuthAt(star, observer, mjd) {
  ensureInit();
  return wasm.starAzimuthAt(star, observer, mjd);
}
export function starCrossings(star, observer, startMjd, endMjd, thresholdDeg) {
  ensureInit();
  return wasm.starCrossings(star, observer, startMjd, endMjd, thresholdDeg);
}
export function starCulminations(star, observer, startMjd, endMjd) {
  ensureInit();
  return wasm.starCulminations(star, observer, startMjd, endMjd);
}
export function starAboveThreshold(
  star,
  observer,
  startMjd,
  endMjd,
  thresholdDeg,
) {
  ensureInit();
  return wasm.starAboveThreshold(
    star,
    observer,
    startMjd,
    endMjd,
    thresholdDeg,
  );
}
export function starBelowThreshold(
  star,
  observer,
  startMjd,
  endMjd,
  thresholdDeg,
) {
  ensureInit();
  return wasm.starBelowThreshold(
    star,
    observer,
    startMjd,
    endMjd,
    thresholdDeg,
  );
}
export function starAzimuthCrossings(
  star,
  observer,
  startMjd,
  endMjd,
  bearingDeg,
) {
  ensureInit();
  return wasm.starAzimuthCrossings(
    star,
    observer,
    startMjd,
    endMjd,
    bearingDeg,
  );
}
export function starAzimuthExtrema(star, observer, startMjd, endMjd) {
  ensureInit();
  return wasm.starAzimuthExtrema(star, observer, startMjd, endMjd);
}

// ── Periods ───────────────────────────────────────────────────────

export function intersectPeriods(periods1, periods2) {
  ensureInit();
  return wasm.intersectPeriods(periods1, periods2);
}

// ── Moon ──────────────────────────────────────────────────────────

export function moonPhase(jd) {
  ensureInit();
  return wasm.moonPhase(jd);
}
export function moonPhaseTopocentric(jd, observer) {
  ensureInit();
  return wasm.moonPhaseTopocentric(jd, observer);
}
export function findPhaseEvents(startMjd, endMjd) {
  ensureInit();
  return wasm.findPhaseEvents(startMjd, endMjd);
}
export function moonIlluminationAbove(startMjd, endMjd, kMin) {
  ensureInit();
  return wasm.moonIlluminationAbove(startMjd, endMjd, kMin);
}
export function moonIlluminationBelow(startMjd, endMjd, kMax) {
  ensureInit();
  return wasm.moonIlluminationBelow(startMjd, endMjd, kMax);
}
export function moonIlluminationRange(startMjd, endMjd, kMin, kMax) {
  ensureInit();
  return wasm.moonIlluminationRange(startMjd, endMjd, kMin, kMax);
}

// ── Meta ──────────────────────────────────────────────────────────

export function version() {
  ensureInit();
  return wasm.version();
}
