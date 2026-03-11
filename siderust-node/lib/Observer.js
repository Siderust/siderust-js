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
   * @param {Quantity} lon Longitude, convertible to Degree.
   * @param {Quantity} lat Latitude, convertible to Degree.
   * @param {Quantity} height Height, convertible to Meter.
   */
  constructor(lon, lat, height) {
    this._lonDeg = _extractQuantityValue(lon, 'Degree', 'lon');
    this._latDeg = _extractQuantityValue(lat, 'Degree', 'lat');
    this._heightM = _extractQuantityValue(height, 'Meter', 'height');

    if (
      !Number.isFinite(this._lonDeg) ||
      !Number.isFinite(this._latDeg) ||
      !Number.isFinite(this._heightM)
    ) {
      throw new Error('Observer coordinates must be finite (not NaN or ±infinity)');
    }
  }

  // ── preset observatories ───────────────────────────────────────

  /** Roque de los Muchachos Observatory (La Palma, Spain). */
  static roqueDeLasMuchachos() {
    return new Observer(
      new Quantity(-17.8925, 'Degree'),
      new Quantity(28.7543, 'Degree'),
      new Quantity(2396, 'Meter'),
    );
  }

  /** Paranal Observatory (ESO, Chile). */
  static elParanal() {
    return new Observer(
      new Quantity(-70.4043, 'Degree'),
      new Quantity(-24.6272, 'Degree'),
      new Quantity(2635, 'Meter'),
    );
  }

  /** Mauna Kea Observatory (Hawaiʻi, USA). */
  static maunaKea() {
    return new Observer(
      new Quantity(-155.4681, 'Degree'),
      new Quantity(19.8207, 'Degree'),
      new Quantity(4207, 'Meter'),
    );
  }

  /** La Silla Observatory (ESO, Chile). */
  static laSilla() {
    return new Observer(
      new Quantity(-70.7346, 'Degree'),
      new Quantity(-29.2584, 'Degree'),
      new Quantity(2400, 'Meter'),
    );
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
 * Extract a canonical scalar value from a `Quantity`.
 * @param {unknown} val
 * @param {string} expectedUnit
 * @param {string} label
 * @returns {number}
 */
function _extractQuantityValue(val, expectedUnit, label) {
  if (!(val instanceof Quantity)) {
    throw new Error(`${label}: expected a Quantity`);
  }
  return val.to(expectedUnit).value;
}

module.exports = { Observer };
