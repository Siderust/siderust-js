/**
 * @siderust/siderust — Observer façade class.
 *
 * A geodetic observer location on the Earth's surface (WGS84 ellipsoid).
 * This is a plain JS class that stores lon/lat/height as plain fields.
 * The native Observer is only used internally for napi calls.
 *
 * @module @siderust/siderust/lib/Observer
 */

'use strict';

const { Quantity } = require('@siderust/qtty');

class Observer {
  /**
   * Create an observer at a geodetic position.
   *
   * Accepts `Quantity` objects or raw numbers for each parameter.
   *
   * @param {Quantity | number} lon   Longitude (Quantity in Degree, or raw degrees, east positive)
   * @param {Quantity | number} lat   Latitude (Quantity in Degree, or raw degrees, north positive)
   * @param {Quantity | number} height Height above WGS84 ellipsoid (Quantity in Meter, or raw metres)
   */
  constructor(lon, lat, height) {
    this._lonDeg = _extractValue(lon, 'Degree', 'lon');
    this._latDeg = _extractValue(lat, 'Degree', 'lat');
    this._heightM = _extractValue(height, 'Meter', 'height');

    if (!Number.isFinite(this._lonDeg) || !Number.isFinite(this._latDeg) || !Number.isFinite(this._heightM)) {
      throw new Error('Observer coordinates must be finite (not NaN or ±infinity)');
    }
  }

  // ── preset observatories ───────────────────────────────────────

  /** Roque de los Muchachos Observatory (La Palma, Spain). */
  static roqueDeLasMuchachos() {
    return new Observer(-17.8925, 28.7543, 2396);
  }

  /** Paranal Observatory (ESO, Chile). */
  static elParanal() {
    return new Observer(-70.4043, -24.6272, 2635);
  }

  /** Mauna Kea Observatory (Hawaiʻi, USA). */
  static maunaKea() {
    return new Observer(-155.4681, 19.8207, 4207);
  }

  /** La Silla Observatory (ESO, Chile). */
  static laSilla() {
    return new Observer(-70.7346, -29.2584, 2400);
  }

  // ── accessors (raw numbers, backward compatible) ───────────────

  /** Longitude in degrees (east positive). */
  get lonDeg() {
    return this._lonDeg;
  }

  /** Latitude in degrees (north positive). */
  get latDeg() {
    return this._latDeg;
  }

  /** Height above the WGS84 ellipsoid in metres. */
  get heightM() {
    return this._heightM;
  }

  // ── typed accessors ────────────────────────────────────────────

  /** Longitude as a `Quantity` in Degree. */
  get lon() {
    return new Quantity(this._lonDeg, 'Degree');
  }

  /** Latitude as a `Quantity` in Degree. */
  get lat() {
    return new Quantity(this._latDeg, 'Degree');
  }

  /** Height as a `Quantity` in Meter. */
  get height() {
    return new Quantity(this._heightM, 'Meter');
  }

  /** Human-readable string representation. */
  format() {
    return `Observer(lon=${this._lonDeg.toFixed(4)}°, lat=${this._latDeg.toFixed(4)}°, h=${this._heightM.toFixed(1)} m)`;
  }
}

/**
 * Extract a number from a Quantity or raw number.
 * @param {Quantity | number} val
 * @param {string} expectedUnit  Default unit name if already Quantity in that unit
 * @param {string} label         Label for error messages
 * @returns {number}
 */
function _extractValue(val, expectedUnit, label) {
  if (typeof val === 'number') return val;
  if (val && typeof val.value === 'number' && typeof val.unit === 'string') {
    if (val.unit === expectedUnit) return val.value;
    // Try converting
    const { convert } = require('@siderust/qtty');
    return convert(val.value, val.unit, expectedUnit);
  }
  throw new Error(`${label}: expected a Quantity or number`);
}

module.exports = { Observer };
