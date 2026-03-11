// @ts-check
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { Quantity } from '@siderust/qtty';
import { JulianDate, ModifiedJulianDate, Period } from '@siderust/tempoch';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const {
  Observer,
  Star,
  angularSeparation,
  bodyAltitudeAt,
  bodyCrossings,
  bodyCulminations,
  directionToCartesian,
  directionToHorizontal,
  findPhaseEvents,
  geodeticToEcef,
  getPlanet,
  intersectPeriods,
  moonIlluminationAbove,
  moonPhase,
  orbitalPeriod,
  starAltitudeAt,
  transformDirection,
  transformPositionCenter,
  version,
  vsop87Heliocentric,
  vsop87MoonGeocentric,
} = require(join(__dirname, '..'));

const DEG = (value) => new Quantity(value, 'Degree');
const M = (value) => new Quantity(value, 'Meter');
const AU = (value) => new Quantity(value, 'AstronomicalUnit');
const LY = (value) => new Quantity(value, 'LightYear');
const SOLAR_MASS = (value) => new Quantity(value, 'SolarMass');
const SOLAR_RADIUS = (value) => new Quantity(value, 'NominalSolarRadius');
const SOLAR_LUMINOSITY = (value) => new Quantity(value, 'SolarLuminosity');

const J2000 = new JulianDate(2_451_545.0);
const MJD_60000 = new ModifiedJulianDate(60_000.0);
const WINDOW = new Period(new ModifiedJulianDate(60_000.0), new ModifiedJulianDate(60_002.0));

describe('version()', () => {
  it('returns a semver-like string', () => {
    assert.match(version(), /^\d+\.\d+\.\d+/);
  });
});

describe('Observer', () => {
  it('requires Quantity inputs and exposes typed getters', () => {
    const observer = new Observer(DEG(-17.8925), DEG(28.7543), M(2396));
    assert.equal(observer.lon.unit, 'Degree');
    assert.equal(observer.lat.unit, 'Degree');
    assert.equal(observer.height.unit, 'Meter');
    assert.match(observer.format(), /Observer/);
  });

  it('rejects raw numbers', () => {
    assert.throws(() => new Observer(-17.8925, 28.7543, 2396), /expected a Quantity/);
  });
});

describe('Star', () => {
  it('requires Quantity inputs and exposes typed getters', () => {
    const star = new Star(
      'TypedStar',
      LY(100),
      SOLAR_MASS(2),
      SOLAR_RADIUS(1.5),
      SOLAR_LUMINOSITY(8),
      DEG(180),
      DEG(-45),
    );

    assert.equal(star.distance.unit, 'LightYear');
    assert.equal(star.mass.unit, 'SolarMass');
    assert.equal(star.ra.unit, 'Degree');
    assert.match(star.format(), /TypedStar/);
  });

  it('rejects raw numbers', () => {
    assert.throws(() => new Star('Broken', 1, 1, 1, 1, 1, 1), /expected a Quantity/);
  });
});

describe('typed outputs', () => {
  it('returns typed planet metadata', () => {
    const mars = getPlanet('Mars');
    assert.equal(mars.mass.unit, 'Kilogram');
    assert.equal(mars.radius.unit, 'Kilometer');
    assert.equal(mars.semiMajorAxis.unit, 'AstronomicalUnit');
    assert.equal(typeof mars.eccentricity, 'number');
    assert.equal(mars.inclination.unit, 'Degree');
  });

  it('returns typed geodetic coordinates', () => {
    const ecef = geodeticToEcef(Observer.roqueDeLasMuchachos());
    assert.equal(ecef.x.unit, 'Meter');
    assert.equal(ecef.y.unit, 'Meter');
    assert.equal(ecef.z.unit, 'Meter');
  });

  it('returns typed ephemeris positions', () => {
    const mars = vsop87Heliocentric('Mars', J2000);
    const moon = vsop87MoonGeocentric(J2000);
    assert.equal(mars.x.unit, 'AstronomicalUnit');
    assert.equal(moon.x.unit, 'Kilometer');
    assert.equal(mars.frame, 'EclipticMeanJ2000');
  });

  it('preserves input length units in center transforms', () => {
    const transformed = transformPositionCenter(
      AU(1),
      AU(0),
      AU(0),
      'Heliocentric',
      'Geocentric',
      J2000,
    );

    assert.equal(transformed.x.unit, 'AstronomicalUnit');
    assert.equal(transformed.y.unit, 'AstronomicalUnit');
    assert.equal(transformed.z.unit, 'AstronomicalUnit');
  });

  it('returns typed direction values', () => {
    const direction = transformDirection(
      DEG(38.78),
      DEG(279.23),
      'EquatorialMeanJ2000',
      'EclipticMeanJ2000',
      J2000,
    );

    const horizontal = directionToHorizontal(
      DEG(38.78),
      DEG(279.23),
      'ICRS',
      J2000,
      Observer.roqueDeLasMuchachos(),
    );

    assert.equal(direction.polar.unit, 'Degree');
    assert.equal(direction.azimuth.unit, 'Degree');
    assert.equal(horizontal.polar.unit, 'Degree');
    assert.equal(horizontal.azimuth.unit, 'Degree');
  });

  it('returns typed scalar astronomy values', () => {
    const separation = angularSeparation(DEG(10), DEG(20), DEG(11), DEG(21), 'ICRS');
    const period = orbitalPeriod('Mars');
    const unitVector = directionToCartesian(DEG(45), DEG(90));

    assert.equal(separation.unit, 'Degree');
    assert.equal(period.unit, 'Day');
    assert.equal(typeof unitVector.x, 'number');
    assert.equal(typeof unitVector.y, 'number');
    assert.equal(typeof unitVector.z, 'number');
  });
});

describe('event APIs', () => {
  it('return typed instantaneous quantities', () => {
    const observer = Observer.roqueDeLasMuchachos();
    const star = Star.catalog('Vega');

    const bodyAltitude = bodyAltitudeAt('Sun', observer, MJD_60000);
    const stellarAltitude = starAltitudeAt(star, observer, MJD_60000);

    assert.equal(bodyAltitude.unit, 'Degree');
    assert.equal(stellarAltitude.unit, 'Degree');
  });

  it('return typed event timestamps and periods', () => {
    const observer = Observer.roqueDeLasMuchachos();

    const crossings = bodyCrossings('Sun', observer, WINDOW, DEG(0));
    const culminations = bodyCulminations('Sun', observer, WINDOW);
    const darkMoon = moonIlluminationAbove(WINDOW, 0.5);
    const phaseEvents = findPhaseEvents(WINDOW);

    for (const event of crossings) {
      assert.ok(event.mjd instanceof ModifiedJulianDate);
    }
    for (const event of culminations) {
      assert.ok(event.mjd instanceof ModifiedJulianDate);
      assert.equal(event.altitude.unit, 'Degree');
    }
    for (const period of darkMoon) {
      assert.ok(period instanceof Period);
    }
    for (const event of phaseEvents) {
      assert.ok(event.mjd instanceof ModifiedJulianDate);
    }
  });

  it('intersects typed periods', () => {
    const periods = intersectPeriods(
      [new Period(new ModifiedJulianDate(60_000.0), new ModifiedJulianDate(60_001.0))],
      [new Period(new ModifiedJulianDate(60_000.5), new ModifiedJulianDate(60_001.5))],
    );

    assert.equal(periods.length, 1);
    assert.ok(periods[0] instanceof Period);
    assert.equal(periods[0].start.value, 60_000.5);
  });
});

describe('moonPhase()', () => {
  it('returns typed angular values', () => {
    const phase = moonPhase(J2000);
    assert.equal(phase.phaseAngle.unit, 'Degree');
    assert.equal(phase.elongation.unit, 'Degree');
    assert.equal(typeof phase.illuminatedFraction, 'number');
  });
});

describe('strict boundary validation', () => {
  it('rejects raw numbers for time and angle inputs', () => {
    const observer = Observer.roqueDeLasMuchachos();

    assert.throws(() => vsop87Heliocentric('Mars', 2_451_545.0), /Expected a JulianDate/);
    assert.throws(() => bodyAltitudeAt('Sun', observer, 60_000.0), /Expected a ModifiedJulianDate/);
    assert.throws(() => bodyCrossings('Sun', observer, MJD_60000, DEG(0)), /Expected a Period/);
    assert.throws(
      () => transformDirection(38.78, DEG(279.23), 'ICRS', 'ICRS', J2000),
      /expected a Quantity/,
    );
  });

  it('rejects structural impostors', () => {
    assert.throws(
      () => new Observer({ value: 1, unit: 'Degree' }, DEG(0), M(0)),
      /expected a Quantity/,
    );
    assert.throws(
      () => bodyAltitudeAt('Sun', Observer.roqueDeLasMuchachos(), { value: 60_000 }),
      /Expected a ModifiedJulianDate/,
    );
  });
});
