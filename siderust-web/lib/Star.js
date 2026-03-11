/**
 * @siderust/siderust-web — Star façade class.
 *
 * A star with physical parameters and sky coordinates.
 * This is a plain JS class; the WASM Star is only used internally.
 *
 * @module @siderust/siderust-web/lib/Star
 */

import { Quantity } from "@siderust/qtty-web";
import * as backend from "./backend.js";

export class Star {
  /**
   * Create a custom star.
   *
   * @param {string} name         Display name
   * @param {Quantity} distance   Distance, convertible to LightYear
   * @param {Quantity} mass       Mass, convertible to SolarMass
   * @param {Quantity} radius     Radius, convertible to NominalSolarRadius
   * @param {Quantity} luminosity Luminosity, convertible to SolarLuminosity
   * @param {Quantity} ra         Right ascension, convertible to Degree
   * @param {Quantity} dec        Declination, convertible to Degree
   */
  constructor(name, distance, mass, radius, luminosity, ra, dec) {
    this._distanceLy = _extractQuantityValue(distance, "LightYear", "distance");
    this._massSolar = _extractQuantityValue(mass, "SolarMass", "mass");
    this._radiusSolar = _extractQuantityValue(
      radius,
      "NominalSolarRadius",
      "radius",
    );
    this._luminositySolar = _extractQuantityValue(
      luminosity,
      "SolarLuminosity",
      "luminosity",
    );
    this._raDeg = _extractQuantityValue(ra, "Degree", "ra");
    this._decDeg = _extractQuantityValue(dec, "Degree", "dec");

    this._name = name;
  }

  /**
   * Look up a star from the built-in catalog by name.
   * @param {string} name
   * @returns {Star}
   */
  static catalog(name) {
    const native = backend.NativeStar.catalog(name);
    return new Star(
      native.name,
      new Quantity(native.distanceLy, "LightYear"),
      new Quantity(native.massSolar, "SolarMass"),
      new Quantity(native.radiusSolar, "NominalSolarRadius"),
      new Quantity(native.luminositySolar, "SolarLuminosity"),
      new Quantity(native.raDeg, "Degree"),
      new Quantity(native.decDeg, "Degree"),
    );
  }

  /** Star name. */
  get name() {
    return this._name;
  }

  // ── typed accessors ────────────────────────────────────────────

  /** Distance as a `Quantity` in LightYear. */
  get distance() {
    return new Quantity(this._distanceLy, "LightYear");
  }
  /** Mass as a `Quantity` in SolarMass. */
  get mass() {
    return new Quantity(this._massSolar, "SolarMass");
  }
  /** Radius as a `Quantity` in NominalSolarRadius. */
  get radius() {
    return new Quantity(this._radiusSolar, "NominalSolarRadius");
  }
  /** Luminosity as a `Quantity` in SolarLuminosity. */
  get luminosity() {
    return new Quantity(this._luminositySolar, "SolarLuminosity");
  }
  /** Right ascension as a `Quantity` in Degree. */
  get ra() {
    return new Quantity(this._raDeg, "Degree");
  }
  /** Declination as a `Quantity` in Degree. */
  get dec() {
    return new Quantity(this._decDeg, "Degree");
  }

  /** Human-readable representation. */
  format() {
    return `Star(${this._name}, d=${this._distanceLy.toFixed(1)} ly, RA=${this._raDeg.toFixed(4)}°, Dec=${this._decDeg.toFixed(4)}°)`;
  }
}

/**
 * Extract a canonical scalar value from a `Quantity`.
 * @param {unknown} value
 * @param {string} unit
 * @param {string} label
 * @returns {number}
 */
function _extractQuantityValue(value, unit, label) {
  if (!(value instanceof Quantity)) {
    throw new Error(`${label}: expected a Quantity`);
  }
  const converted = value.to(unit).value;
  if (!Number.isFinite(converted)) {
    throw new Error(`${label} must be finite (not NaN or ±infinity)`);
  }
  return converted;
}
