/* tslint:disable */
/* eslint-disable */

import { Quantity } from '@siderust/qtty'
import { JulianDate, ModifiedJulianDate, Period } from '@siderust/tempoch'

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

export declare class Observer {
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

export declare class Star {
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

export declare function getPlanet(name: string): PlanetInfo
export declare function listBodies(): Array<string>
export declare function listCatalogStars(): Array<string>

export declare function transformDirection(
  polar: Quantity,
  azimuth: Quantity,
  srcFrame: string,
  dstFrame: string,
  jd: JulianDate
): SphericalDirection

export declare function directionToHorizontal(
  polar: Quantity,
  azimuth: Quantity,
  srcFrame: string,
  jd: JulianDate,
  observer: Observer
): SphericalDirection

export declare function geodeticToEcef(observer: Observer): CartesianEcef

export declare function angularSeparation(
  polar1: Quantity,
  azimuth1: Quantity,
  polar2: Quantity,
  azimuth2: Quantity,
  frame: string
): Quantity

export declare function cartesianDistance(
  x1: Quantity,
  y1: Quantity,
  z1: Quantity,
  x2: Quantity,
  y2: Quantity,
  z2: Quantity
): Quantity

export declare function cartesianMagnitude(x: Quantity, y: Quantity, z: Quantity): Quantity

export declare function dotProduct(
  x1: number,
  y1: number,
  z1: number,
  x2: number,
  y2: number,
  z2: number
): number

export declare function directionToCartesian(
  polar: Quantity,
  azimuth: Quantity
): CartesianUnitVector

export declare function vsop87Heliocentric(body: string, jd: JulianDate): CartesianPosition
export declare function vsop87Barycentric(body: string, jd: JulianDate): CartesianPosition
export declare function vsop87SunBarycentric(jd: JulianDate): CartesianPosition
export declare function vsop87EarthBarycentric(jd: JulianDate): CartesianPosition
export declare function vsop87EarthHeliocentric(jd: JulianDate): CartesianPosition
export declare function vsop87MoonGeocentric(jd: JulianDate): CartesianPosition

export declare function transformPositionCenter(
  x: Quantity,
  y: Quantity,
  z: Quantity,
  srcCenter: string,
  dstCenter: string,
  jd: JulianDate
): CartesianPosition

export declare function transformPositionFrame(
  x: Quantity,
  y: Quantity,
  z: Quantity,
  srcFrame: string,
  dstFrame: string,
  jd: JulianDate
): CartesianPosition

export declare function orbitalPeriod(name: string): Quantity

export declare function bodyAltitudeAt(
  body: string,
  observer: Observer,
  mjd: ModifiedJulianDate
): Quantity

export declare function bodyAzimuthAt(
  body: string,
  observer: Observer,
  mjd: ModifiedJulianDate
): Quantity

export declare function bodyCrossings(
  body: string,
  observer: Observer,
  window: Period,
  threshold: Quantity
): Array<CrossingEvent>

export declare function bodyCulminations(
  body: string,
  observer: Observer,
  window: Period
): Array<CulminationEvent>

export declare function bodyAboveThreshold(
  body: string,
  observer: Observer,
  window: Period,
  threshold: Quantity
): Array<Period>

export declare function bodyBelowThreshold(
  body: string,
  observer: Observer,
  window: Period,
  threshold: Quantity
): Array<Period>

export declare function bodyAzimuthCrossings(
  body: string,
  observer: Observer,
  window: Period,
  bearing: Quantity
): Array<AzimuthCrossingEvent>

export declare function bodyAzimuthExtrema(
  body: string,
  observer: Observer,
  window: Period
): Array<AzimuthExtremum>

export declare function starAltitudeAt(
  star: Star,
  observer: Observer,
  mjd: ModifiedJulianDate
): Quantity

export declare function starAzimuthAt(
  star: Star,
  observer: Observer,
  mjd: ModifiedJulianDate
): Quantity

export declare function starCrossings(
  star: Star,
  observer: Observer,
  window: Period,
  threshold: Quantity
): Array<CrossingEvent>

export declare function starCulminations(
  star: Star,
  observer: Observer,
  window: Period
): Array<CulminationEvent>

export declare function starAboveThreshold(
  star: Star,
  observer: Observer,
  window: Period,
  threshold: Quantity
): Array<Period>

export declare function starBelowThreshold(
  star: Star,
  observer: Observer,
  window: Period,
  threshold: Quantity
): Array<Period>

export declare function starAzimuthCrossings(
  star: Star,
  observer: Observer,
  window: Period,
  bearing: Quantity
): Array<AzimuthCrossingEvent>

export declare function starAzimuthExtrema(
  star: Star,
  observer: Observer,
  window: Period
): Array<AzimuthExtremum>

export declare function intersectPeriods(
  periods1: Array<Period>,
  periods2: Array<Period>
): Array<Period>

export declare function moonPhase(jd: JulianDate): MoonPhase
export declare function moonPhaseTopocentric(jd: JulianDate, observer: Observer): MoonPhase
export declare function findPhaseEvents(window: Period): Array<PhaseEvent>
export declare function moonIlluminationAbove(window: Period, kMin: number): Array<Period>
export declare function moonIlluminationBelow(window: Period, kMax: number): Array<Period>
export declare function moonIlluminationRange(window: Period, kMin: number, kMax: number): Array<Period>

export declare function version(): string
