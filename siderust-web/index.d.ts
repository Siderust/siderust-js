/* eslint-disable */

import { Quantity } from '@siderust/qtty-web';

// ─── Initialisation ────────────────────────────────────────────────────────
/**
 * Initialise the WASM module.  Must be called (and `await`-ed) before any
 * other function in this package.
 *
 * ```js
 * import { init, Observer, bodyAltitudeAt } from '@siderust/siderust-web';
 * await init();                          // bundler
 * await init('./siderust_web_bg.wasm');  // static / GitHub Pages
 * ```
 */
export function init(
  module_or_path?: RequestInfo | URL | Response | BufferSource | WebAssembly.Module
): Promise<void>;

// ─── Scalar types ──────────────────────────────────────────────────────────

/** Physical parameters of a solar-system planet. */
export interface PlanetInfo {
  name: string;
  massKg: number;
  radiusKm: number;
  semiMajorAxisAu: number;
  eccentricity: number;
  inclinationDeg: number;
}

/** A spherical direction (two angles in degrees) with a frame label. */
export interface SphericalDirection {
  polarDeg: number;
  azimuthDeg: number;
  frame: string;
}

/** Cartesian ECEF coordinates in metres. */
export interface CartesianEcef {
  x: number;
  y: number;
  z: number;
}

/** A 3D Cartesian position with frame and center metadata. */
export interface CartesianPosition {
  x: number;
  y: number;
  z: number;
  frame: string;
  center: string;
}

/** A threshold-crossing event (rise or set). */
export interface CrossingEvent {
  mjd: number;
  direction: string;
}

/** A culmination event (local altitude extremum). */
export interface CulminationEvent {
  mjd: number;
  altitudeDeg: number;
  kind: string;
}

/** A time period (MJD interval). */
export interface MjdPeriod {
  startMjd: number;
  endMjd: number;
}

/** An azimuth-crossing event. */
export interface AzimuthCrossingEvent {
  mjd: number;
  direction: string;
}

/** An azimuth extremum (local max or min bearing). */
export interface AzimuthExtremum {
  mjd: number;
  azimuthDeg: number;
  kind: string;
}

/** Moon phase geometry at a single instant. */
export interface MoonPhase {
  phaseAngleDeg: number;
  illuminatedFraction: number;
  elongationDeg: number;
  waxing: boolean;
  label: string;
}

/** A principal lunar phase event. */
export interface PhaseEvent {
  mjd: number;
  kind: string;
}

// ─── Observer class ────────────────────────────────────────────────────────

/**
 * A geodetic observer location on the Earth's surface (WGS84 ellipsoid).
 *
 * Constructor accepts `Quantity` objects or raw numbers.
 *
 * ```js
 * const obs = new Observer(-17.8925, 28.7543, 2396);
 * const orm = Observer.roqueDeLasMuchachos();
 * ```
 */
export class Observer {
  constructor(lon: Quantity | number, lat: Quantity | number, height: Quantity | number);
  static roqueDeLasMuchachos(): Observer;
  static elParanal(): Observer;
  static maunaKea(): Observer;
  static laSilla(): Observer;
  get lonDeg(): number;
  get latDeg(): number;
  get heightM(): number;
  get lon(): Quantity;
  get lat(): Quantity;
  get height(): Quantity;
  format(): string;
}

// ─── Star class ────────────────────────────────────────────────────────────

/**
 * A star with physical parameters and sky coordinates.
 *
 * ```js
 * const vega = Star.catalog('Vega');
 * const custom = new Star('MyStar', 100, 1.5, 1.2, 3.0, 200.0, 45.0);
 * ```
 */
export class Star {
  constructor(
    name: string,
    distanceLy: number,
    massSolar: number,
    radiusSolar: number,
    luminositySolar: number,
    raDeg: number,
    decDeg: number
  );
  static catalog(name: string): Star;
  get name(): string;
  get distanceLy(): number;
  get massSolar(): number;
  get radiusSolar(): number;
  get luminositySolar(): number;
  get raDeg(): number;
  get decDeg(): number;
  get distance(): Quantity;
  get mass(): Quantity;
  get radius(): Quantity;
  get luminosity(): Quantity;
  get ra(): Quantity;
  get dec(): Quantity;
  format(): string;
}

// ─── Bodies ────────────────────────────────────────────────────────────────

export function getPlanet(name: string): PlanetInfo;
export function listBodies(): string[];
export function listCatalogStars(): string[];

// ─── Coordinates ───────────────────────────────────────────────────────────

export function transformDirection(
  polarDeg: number, azimuthDeg: number,
  srcFrame: string, dstFrame: string, jd: number
): SphericalDirection;

export function directionToHorizontal(
  polarDeg: number, azimuthDeg: number,
  srcFrame: string, jd: number, observer: Observer
): SphericalDirection;

export function geodeticToEcef(observer: Observer): CartesianEcef;

export function angularSeparation(
  polar1Deg: number, azimuth1Deg: number,
  polar2Deg: number, azimuth2Deg: number,
  frame: string
): number;

export function cartesianDistance(
  x1: number, y1: number, z1: number,
  x2: number, y2: number, z2: number
): number;

export function cartesianMagnitude(x: number, y: number, z: number): number;

export function dotProduct(
  x1: number, y1: number, z1: number,
  x2: number, y2: number, z2: number
): number;

export function directionToCartesian(
  polarDeg: number, azimuthDeg: number
): CartesianEcef;

// ─── Ephemeris ─────────────────────────────────────────────────────────────

export function vsop87Heliocentric(body: string, jd: number): CartesianPosition;
export function vsop87Barycentric(body: string, jd: number): CartesianPosition;
export function vsop87SunBarycentric(jd: number): CartesianPosition;
export function vsop87EarthBarycentric(jd: number): CartesianPosition;
export function vsop87EarthHeliocentric(jd: number): CartesianPosition;
export function vsop87MoonGeocentric(jd: number): CartesianPosition;

export function transformPositionCenter(
  x: number, y: number, z: number,
  srcCenter: string, dstCenter: string, jd: number
): CartesianPosition;

export function transformPositionFrame(
  x: number, y: number, z: number,
  srcFrame: string, dstFrame: string, jd: number
): CartesianPosition;

export function orbitalPeriodDays(name: string): number;

// ─── Events — body ─────────────────────────────────────────────────────────

export function bodyAltitudeAt(body: string, observer: Observer, mjd: number): number;
export function bodyAzimuthAt(body: string, observer: Observer, mjd: number): number;

export function bodyCrossings(
  body: string, observer: Observer,
  startMjd: number, endMjd: number, thresholdDeg: number
): CrossingEvent[];

export function bodyCulminations(
  body: string, observer: Observer,
  startMjd: number, endMjd: number
): CulminationEvent[];

export function bodyAboveThreshold(
  body: string, observer: Observer,
  startMjd: number, endMjd: number, thresholdDeg: number
): MjdPeriod[];

export function bodyBelowThreshold(
  body: string, observer: Observer,
  startMjd: number, endMjd: number, thresholdDeg: number
): MjdPeriod[];

export function bodyAzimuthCrossings(
  body: string, observer: Observer,
  startMjd: number, endMjd: number, bearingDeg: number
): AzimuthCrossingEvent[];

export function bodyAzimuthExtrema(
  body: string, observer: Observer,
  startMjd: number, endMjd: number
): AzimuthExtremum[];

// ─── Events — star ─────────────────────────────────────────────────────────

export function starAltitudeAt(star: Star, observer: Observer, mjd: number): number;
export function starAzimuthAt(star: Star, observer: Observer, mjd: number): number;

export function starCrossings(
  star: Star, observer: Observer,
  startMjd: number, endMjd: number, thresholdDeg: number
): CrossingEvent[];

export function starCulminations(
  star: Star, observer: Observer,
  startMjd: number, endMjd: number
): CulminationEvent[];

export function starAboveThreshold(
  star: Star, observer: Observer,
  startMjd: number, endMjd: number, thresholdDeg: number
): MjdPeriod[];

export function starBelowThreshold(
  star: Star, observer: Observer,
  startMjd: number, endMjd: number, thresholdDeg: number
): MjdPeriod[];

export function starAzimuthCrossings(
  star: Star, observer: Observer,
  startMjd: number, endMjd: number, bearingDeg: number
): AzimuthCrossingEvent[];

export function starAzimuthExtrema(
  star: Star, observer: Observer,
  startMjd: number, endMjd: number
): AzimuthExtremum[];

export function intersectPeriods(
  periods1: MjdPeriod[], periods2: MjdPeriod[]
): MjdPeriod[];

// ─── Moon phases ───────────────────────────────────────────────────────────

export function moonPhase(jd: number): MoonPhase;
export function moonPhaseTopocentric(jd: number, observer: Observer): MoonPhase;

export function findPhaseEvents(
  startMjd: number, endMjd: number
): PhaseEvent[];

export function moonIlluminationAbove(
  startMjd: number, endMjd: number, kMin: number
): MjdPeriod[];

export function moonIlluminationBelow(
  startMjd: number, endMjd: number, kMax: number
): MjdPeriod[];

export function moonIlluminationRange(
  startMjd: number, endMjd: number, kMin: number, kMax: number
): MjdPeriod[];

// ─── Utility ───────────────────────────────────────────────────────────────

export function version(): string;
