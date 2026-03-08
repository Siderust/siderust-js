/**
 * @siderust/siderust — Star façade class.
 *
 * A star with physical parameters and sky coordinates.
 * This is a plain JS class that stores raw properties.
 *
 * @module @siderust/siderust/lib/Star
 */

'use strict';

const { Quantity } = require('@siderust/qtty');
const backend = require('./backend.js');

class Star {
  /**
   * Create a custom star.
   *
   * @param {string} name         Display name
   * @param {number} distanceLy   Distance in light-years
   * @param {number} massSolar    Mass in solar masses (M☉)
   * @param {number} radiusSolar  Radius in solar radii (R☉)
   * @param {number} luminositySolar Luminosity in solar luminosities (L☉)
   * @param {number} raDeg        Right ascension at J2000.0 in degrees
   * @param {number} decDeg       Declination at J2000.0 in degrees
   */
  constructor(name, distanceLy, massSolar, radiusSolar, luminositySolar, raDeg, decDeg) {
    for (const [label, v] of [
      ['distanceLy', distanceLy],
      ['massSolar', massSolar],
      ['radiusSolar', radiusSolar],
      ['luminositySolar', luminositySolar],
      ['raDeg', raDeg],
      ['decDeg', decDeg],
    ]) {
      if (typeof v !== 'number' || !Number.isFinite(v)) {
        throw new Error(`${label} must be finite (not NaN or ±infinity)`);
      }
    }

    this._name = name;
    this._distanceLy = distanceLy;
    this._massSolar = massSolar;
    this._radiusSolar = radiusSolar;
    this._luminositySolar = luminositySolar;
    this._raDeg = raDeg;
    this._decDeg = decDeg;
  }

  /**
   * Look up a star from the built-in catalog by name.
   * @param {string} name
   * @returns {Star}
   */
  static catalog(name) {
    // Delegate to native for the catalog data
    const native = backend.NativeStar.catalog(name);
    return new Star(
      native.name,
      native.distanceLy,
      native.massSolar,
      native.radiusSolar,
      native.luminositySolar,
      native.raDeg,
      native.decDeg,
    );
  }

  // ── raw-number accessors (backward compatible) ─────────────────

  /** Star name. */
  get name() {
    return this._name;
  }

  /** Distance in light-years. */
  get distanceLy() {
    return this._distanceLy;
  }

  /** Mass in solar masses (M☉). */
  get massSolar() {
    return this._massSolar;
  }

  /** Radius in solar radii (R☉). */
  get radiusSolar() {
    return this._radiusSolar;
  }

  /** Luminosity in solar luminosities (L☉). */
  get luminositySolar() {
    return this._luminositySolar;
  }

  /** Right ascension at J2000.0 in degrees. */
  get raDeg() {
    return this._raDeg;
  }

  /** Declination at J2000.0 in degrees. */
  get decDeg() {
    return this._decDeg;
  }

  // ── typed accessors ────────────────────────────────────────────

  /** Distance as a `Quantity` in LightYear. */
  get distance() {
    return new Quantity(this._distanceLy, 'LightYear');
  }

  /** Mass as a `Quantity` in SolarMass. */
  get mass() {
    return new Quantity(this._massSolar, 'SolarMass');
  }

  /** Radius as a `Quantity` in SolarRadius. */
  get radius() {
    return new Quantity(this._radiusSolar, 'SolarRadius');
  }

  /** Luminosity as a `Quantity` in SolarLuminosity. */
  get luminosity() {
    return new Quantity(this._luminositySolar, 'SolarLuminosity');
  }

  /** Right ascension as a `Quantity` in Degree. */
  get ra() {
    return new Quantity(this._raDeg, 'Degree');
  }

  /** Declination as a `Quantity` in Degree. */
  get dec() {
    return new Quantity(this._decDeg, 'Degree');
  }

  /** Human-readable representation. */
  format() {
    return `Star(${this._name}, d=${this._distanceLy.toFixed(1)} ly, RA=${this._raDeg.toFixed(4)}°, Dec=${this._decDeg.toFixed(4)}°)`;
  }
}

module.exports = { Star };
