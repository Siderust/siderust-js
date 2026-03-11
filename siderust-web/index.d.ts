/* eslint-disable */

import { Quantity } from '@siderust/qtty-web'
import { JulianDate, ModifiedJulianDate, Period } from '@siderust/tempoch-web'

export function init(
  module_or_path?: RequestInfo | URL | Response | BufferSource | WebAssembly.Module
): Promise<void>

export interface PlanetInfo {
  name: string
  mass: Quantity
  radius: Quantity
  semiMajorAxis: Quantity
  eccentricity: number
  inclination: Quantity
}

export interface SphericalDirection {
  polar: Quantity
  azimuth: Quantity
  frame: string
}

export interface CartesianEcef {
  x: Quantity
  y: Quantity
  z: Quantity
}

export interface CartesianUnitVector {
  x: number
  y: number
  z: number
}

export interface CartesianPosition {
  x: Quantity
  y: Quantity
  z: Quantity
  frame: string
  center: string
}

export interface CrossingEvent {
  mjd: ModifiedJulianDate
  direction: string
}

export interface CulminationEvent {
  mjd: ModifiedJulianDate
  altitude: Quantity
  kind: string
}

export interface AzimuthCrossingEvent {
  mjd: ModifiedJulianDate
  direction: string
}

export interface AzimuthExtremum {
  mjd: ModifiedJulianDate
  azimuth: Quantity
  kind: string
}

export interface MoonPhase {
  phaseAngle: Quantity
  illuminatedFraction: number
  elongation: Quantity
  waxing: boolean
  label: string
}

export interface PhaseEvent {
  mjd: ModifiedJulianDate
  kind: string
}

export class Observer {
  constructor(lon: Quantity, lat: Quantity, height: Quantity)
  static roqueDeLasMuchachos(): Observer
  static elParanal(): Observer
  static maunaKea(): Observer
  static laSilla(): Observer
  get lon(): Quantity
  get lat(): Quantity
  get height(): Quantity
  format(): string
}

export class Star {
  constructor(
    name: string,
    distance: Quantity,
    mass: Quantity,
    radius: Quantity,
    luminosity: Quantity,
    ra: Quantity,
    dec: Quantity
  )
  static catalog(name: string): Star
  get name(): string
  get distance(): Quantity
  get mass(): Quantity
  get radius(): Quantity
  get luminosity(): Quantity
  get ra(): Quantity
  get dec(): Quantity
  format(): string
}

export function getPlanet(name: string): PlanetInfo
export function listBodies(): Array<string>
export function listCatalogStars(): Array<string>

export function transformDirection(
  polar: Quantity,
  azimuth: Quantity,
  srcFrame: string,
  dstFrame: string,
  jd: JulianDate
): SphericalDirection

export function directionToHorizontal(
  polar: Quantity,
  azimuth: Quantity,
  srcFrame: string,
  jd: JulianDate,
  observer: Observer
): SphericalDirection

export function geodeticToEcef(observer: Observer): CartesianEcef

export function angularSeparation(
  polar1: Quantity,
  azimuth1: Quantity,
  polar2: Quantity,
  azimuth2: Quantity,
  frame: string
): Quantity

export function cartesianDistance(
  x1: Quantity,
  y1: Quantity,
  z1: Quantity,
  x2: Quantity,
  y2: Quantity,
  z2: Quantity
): Quantity

export function cartesianMagnitude(x: Quantity, y: Quantity, z: Quantity): Quantity

export function dotProduct(
  x1: number,
  y1: number,
  z1: number,
  x2: number,
  y2: number,
  z2: number
): number

export function directionToCartesian(
  polar: Quantity,
  azimuth: Quantity
): CartesianUnitVector

export function vsop87Heliocentric(body: string, jd: JulianDate): CartesianPosition
export function vsop87Barycentric(body: string, jd: JulianDate): CartesianPosition
export function vsop87SunBarycentric(jd: JulianDate): CartesianPosition
export function vsop87EarthBarycentric(jd: JulianDate): CartesianPosition
export function vsop87EarthHeliocentric(jd: JulianDate): CartesianPosition
export function vsop87MoonGeocentric(jd: JulianDate): CartesianPosition

export function transformPositionCenter(
  x: Quantity,
  y: Quantity,
  z: Quantity,
  srcCenter: string,
  dstCenter: string,
  jd: JulianDate
): CartesianPosition

export function transformPositionFrame(
  x: Quantity,
  y: Quantity,
  z: Quantity,
  srcFrame: string,
  dstFrame: string,
  jd: JulianDate
): CartesianPosition

export function orbitalPeriod(name: string): Quantity

export function bodyAltitudeAt(
  body: string,
  observer: Observer,
  mjd: ModifiedJulianDate
): Quantity

export function bodyAzimuthAt(
  body: string,
  observer: Observer,
  mjd: ModifiedJulianDate
): Quantity

export function bodyCrossings(
  body: string,
  observer: Observer,
  window: Period,
  threshold: Quantity
): Array<CrossingEvent>

export function bodyCulminations(
  body: string,
  observer: Observer,
  window: Period
): Array<CulminationEvent>

export function bodyAboveThreshold(
  body: string,
  observer: Observer,
  window: Period,
  threshold: Quantity
): Array<Period>

export function bodyBelowThreshold(
  body: string,
  observer: Observer,
  window: Period,
  threshold: Quantity
): Array<Period>

export function bodyAzimuthCrossings(
  body: string,
  observer: Observer,
  window: Period,
  bearing: Quantity
): Array<AzimuthCrossingEvent>

export function bodyAzimuthExtrema(
  body: string,
  observer: Observer,
  window: Period
): Array<AzimuthExtremum>

export function starAltitudeAt(
  star: Star,
  observer: Observer,
  mjd: ModifiedJulianDate
): Quantity

export function starAzimuthAt(
  star: Star,
  observer: Observer,
  mjd: ModifiedJulianDate
): Quantity

export function starCrossings(
  star: Star,
  observer: Observer,
  window: Period,
  threshold: Quantity
): Array<CrossingEvent>

export function starCulminations(
  star: Star,
  observer: Observer,
  window: Period
): Array<CulminationEvent>

export function starAboveThreshold(
  star: Star,
  observer: Observer,
  window: Period,
  threshold: Quantity
): Array<Period>

export function starBelowThreshold(
  star: Star,
  observer: Observer,
  window: Period,
  threshold: Quantity
): Array<Period>

export function starAzimuthCrossings(
  star: Star,
  observer: Observer,
  window: Period,
  bearing: Quantity
): Array<AzimuthCrossingEvent>

export function starAzimuthExtrema(
  star: Star,
  observer: Observer,
  window: Period
): Array<AzimuthExtremum>

export function intersectPeriods(
  periods1: Array<Period>,
  periods2: Array<Period>
): Array<Period>

export function moonPhase(jd: JulianDate): MoonPhase
export function moonPhaseTopocentric(jd: JulianDate, observer: Observer): MoonPhase
export function findPhaseEvents(window: Period): Array<PhaseEvent>
export function moonIlluminationAbove(window: Period, kMin: number): Array<Period>
export function moonIlluminationBelow(window: Period, kMax: number): Array<Period>
export function moonIlluminationRange(window: Period, kMin: number, kMax: number): Array<Period>

export function version(): string
