// @ts-check
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const {
  Observer,
  Star,
  bodyAltitudeAt,
  bodyAzimuthAt,
  bodyCrossings,
  bodyCulminations,
  bodyAboveThreshold,
  bodyBelowThreshold,
  bodyAzimuthCrossings,
  bodyAzimuthExtrema,
  directionToHorizontal,
  findPhaseEvents,
  geodeticToEcef,
  getPlanet,
  listBodies,
  listCatalogStars,
  moonIlluminationAbove,
  moonIlluminationBelow,
  moonIlluminationRange,
  moonPhase,
  moonPhaseTopocentric,
  starAltitudeAt,
  starAzimuthAt,
  starCrossings,
  starCulminations,
  starAboveThreshold,
  starBelowThreshold,
  transformDirection,
  version,
  vsop87Barycentric,
  vsop87EarthBarycentric,
  vsop87EarthHeliocentric,
  vsop87Heliocentric,
  vsop87MoonGeocentric,
  vsop87SunBarycentric,
} = require(join(__dirname, '..', 'index.js'));

// ── Constants ──────────────────────────────────────────────────────────────
const J2000_JD = 2_451_545.0;
const MJD_START = 60_000.0; // 2023-02-25
const MJD_END = 60_002.0;   // 2023-02-27

// ═══════════════════════════════════════════════════════════════════════════
// version
// ═══════════════════════════════════════════════════════════════════════════

describe('version()', () => {
  it('returns a semver-like string', () => {
    const v = version();
    assert.ok(/^\d+\.\d+\.\d+/.test(v), `version "${v}" is not semver-like`);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Observer
// ═══════════════════════════════════════════════════════════════════════════

describe('Observer', () => {
  describe('constructor', () => {
    it('stores lon/lat/height', () => {
      const obs = new Observer(-17.89, 28.75, 2396.0);
      assert.ok(Math.abs(obs.lonDeg - (-17.89)) < 1e-9);
      assert.ok(Math.abs(obs.latDeg - 28.75) < 1e-9);
      assert.ok(Math.abs(obs.heightM - 2396.0) < 1e-9);
    });
  });

  describe('presets', () => {
    it('roqueDeLasMuchachos has correct approximate location', () => {
      const obs = Observer.roqueDeLasMuchachos();
      assert.ok(obs.lonDeg < -17 && obs.lonDeg > -18);
      assert.ok(obs.latDeg > 28 && obs.latDeg < 29);
    });

    it('elParanal has negative longitude (Chile)', () => {
      assert.ok(Observer.elParanal().lonDeg < 0);
    });

    it('maunaKea has negative longitude (Hawaii)', () => {
      assert.ok(Observer.maunaKea().lonDeg < 0);
    });

    it('laSilla has negative longitude (Chile)', () => {
      assert.ok(Observer.laSilla().lonDeg < 0);
    });
  });

  describe('format()', () => {
    it('returns a human-readable string', () => {
      const obs = Observer.roqueDeLasMuchachos();
      const s = obs.format();
      assert.ok(s.includes('Observer'), `format() = "${s}"`);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Bodies
// ═══════════════════════════════════════════════════════════════════════════

describe('listBodies()', () => {
  it('returns 9 solar-system bodies', () => {
    const bodies = listBodies();
    assert.equal(bodies.length, 9);
    assert.ok(bodies.includes('Sun'));
    assert.ok(bodies.includes('Moon'));
    assert.ok(bodies.includes('Mars'));
  });
});

describe('getPlanet()', () => {
  it('returns planet data for Mars', () => {
    const mars = getPlanet('Mars');
    assert.equal(mars.name, 'Mars');
    assert.ok(mars.massKg > 6e23);
    assert.ok(mars.radiusKm > 3000 && mars.radiusKm < 4000);
    assert.ok(mars.semiMajorAxisAu > 1.5);
  });

  it('returns planet data for Earth', () => {
    const earth = getPlanet('Earth');
    assert.equal(earth.name, 'Earth');
    assert.ok(earth.massKg > 5e24);
  });

  it('throws for unknown planet', () => {
    assert.throws(() => getPlanet('Pluto'), /Unknown planet/);
  });

  it('is case-insensitive', () => {
    const m1 = getPlanet('Mars');
    const m2 = getPlanet('mars');
    assert.equal(m1.massKg, m2.massKg);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Star
// ═══════════════════════════════════════════════════════════════════════════

describe('Star', () => {
  describe('catalog()', () => {
    it('looks up Vega', () => {
      const vega = Star.catalog('Vega');
      assert.equal(vega.name, 'Vega');
      assert.ok(vega.distanceLy > 20 && vega.distanceLy < 30);
    });

    it('looks up all 10 catalog stars', () => {
      const names = listCatalogStars();
      assert.equal(names.length, 10);
      for (const name of names) {
        const star = Star.catalog(name);
        assert.equal(star.name, name);
      }
    });

    it('throws for unknown star', () => {
      assert.throws(() => Star.catalog('Nonexistent'), /Unknown/);
    });
  });

  describe('constructor (custom star)', () => {
    it('stores all properties', () => {
      const s = new Star('TestStar', 100, 2.0, 1.5, 10, 180.0, -45.0);
      assert.equal(s.name, 'TestStar');
      assert.ok(Math.abs(s.distanceLy - 100) < 1e-9);
      assert.ok(Math.abs(s.raDeg - 180) < 1e-9);
      assert.ok(Math.abs(s.decDeg - (-45)) < 1e-9);
    });
  });

  describe('format()', () => {
    it('includes the star name', () => {
      const vega = Star.catalog('Vega');
      assert.ok(vega.format().includes('Vega'));
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Body altitude/azimuth — instantaneous
// ═══════════════════════════════════════════════════════════════════════════

describe('bodyAltitudeAt()', () => {
  it('returns a finite number', () => {
    const obs = Observer.roqueDeLasMuchachos();
    const alt = bodyAltitudeAt('Sun', obs, MJD_START);
    assert.ok(Number.isFinite(alt));
  });

  it('altitude is in [-90, 90]', () => {
    const obs = Observer.roqueDeLasMuchachos();
    const alt = bodyAltitudeAt('Moon', obs, MJD_START);
    assert.ok(alt >= -90 && alt <= 90, `altitude = ${alt}`);
  });

  it('throws for unknown body', () => {
    const obs = Observer.roqueDeLasMuchachos();
    assert.throws(() => bodyAltitudeAt('Pluto', obs, MJD_START), /Unknown body/);
  });

  it('throws for NaN mjd', () => {
    const obs = Observer.roqueDeLasMuchachos();
    assert.throws(() => bodyAltitudeAt('Sun', obs, NaN), /finite/i);
  });
});

describe('bodyAzimuthAt()', () => {
  it('returns a finite number', () => {
    const obs = Observer.roqueDeLasMuchachos();
    const az = bodyAzimuthAt('Sun', obs, MJD_START);
    assert.ok(Number.isFinite(az));
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Body altitude/azimuth — batch events
// ═══════════════════════════════════════════════════════════════════════════

describe('bodyCrossings()', () => {
  it('finds Sun rise/set events in a 2-day window', () => {
    const obs = Observer.roqueDeLasMuchachos();
    const events = bodyCrossings('Sun', obs, MJD_START, MJD_END, 0.0);
    assert.ok(events.length >= 2, `expected >= 2 events, got ${events.length}`);
    for (const e of events) {
      assert.ok(e.mjd >= MJD_START && e.mjd <= MJD_END);
      assert.ok(e.direction === 'rising' || e.direction === 'setting');
    }
  });

  it('returns empty for a very high threshold', () => {
    const obs = Observer.roqueDeLasMuchachos();
    const events = bodyCrossings('Sun', obs, MJD_START, MJD_END, 89.0);
    assert.equal(events.length, 0);
  });

  it('validates window bounds', () => {
    const obs = Observer.roqueDeLasMuchachos();
    assert.throws(
      () => bodyCrossings('Sun', obs, MJD_END, MJD_START, 0.0),
      /start.*before.*end/i,
    );
  });
});

describe('bodyCulminations()', () => {
  it('finds upper and lower culminations', () => {
    const obs = Observer.roqueDeLasMuchachos();
    const culms = bodyCulminations('Sun', obs, MJD_START, MJD_END);
    assert.ok(culms.length >= 2);
    const kinds = culms.map(c => c.kind);
    assert.ok(kinds.includes('max'));
    assert.ok(kinds.includes('min'));
  });
});

describe('bodyAboveThreshold()', () => {
  it('returns periods for Sun above horizon', () => {
    const obs = Observer.roqueDeLasMuchachos();
    const periods = bodyAboveThreshold('Sun', obs, MJD_START, MJD_END, 0.0);
    assert.ok(periods.length >= 1);
    for (const p of periods) {
      assert.ok(p.startMjd < p.endMjd);
    }
  });
});

describe('bodyBelowThreshold()', () => {
  it('returns periods for Sun below horizon', () => {
    const obs = Observer.roqueDeLasMuchachos();
    const periods = bodyBelowThreshold('Sun', obs, MJD_START, MJD_END, 0.0);
    assert.ok(periods.length >= 1);
  });
});

describe('bodyAzimuthCrossings()', () => {
  it('finds azimuth crossings for the Sun', () => {
    const obs = Observer.roqueDeLasMuchachos();
    const events = bodyAzimuthCrossings('Sun', obs, MJD_START, MJD_END, 180.0);
    // Sun crosses 180° (south) once per day in northern hemisphere
    assert.ok(events.length >= 1);
  });
});

describe('bodyAzimuthExtrema()', () => {
  it('returns an array (may be empty for short windows)', () => {
    const obs = Observer.roqueDeLasMuchachos();
    const events = bodyAzimuthExtrema('Moon', obs, MJD_START, MJD_END);
    assert.ok(Array.isArray(events));
    for (const e of events) {
      assert.ok(e.kind === 'max' || e.kind === 'min');
      assert.ok(Number.isFinite(e.azimuthDeg));
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Star altitude/azimuth
// ═══════════════════════════════════════════════════════════════════════════

describe('starAltitudeAt()', () => {
  it('returns a finite altitude for Vega', () => {
    const obs = Observer.roqueDeLasMuchachos();
    const vega = Star.catalog('Vega');
    const alt = starAltitudeAt(vega, obs, MJD_START);
    assert.ok(Number.isFinite(alt));
    assert.ok(alt >= -90 && alt <= 90);
  });
});

describe('starAzimuthAt()', () => {
  it('returns a finite azimuth for Sirius', () => {
    const obs = Observer.roqueDeLasMuchachos();
    const sirius = Star.catalog('Sirius');
    const az = starAzimuthAt(sirius, obs, MJD_START);
    assert.ok(Number.isFinite(az));
  });
});

describe('starCrossings()', () => {
  it('finds Vega crossings above 10°', () => {
    const obs = Observer.roqueDeLasMuchachos();
    const vega = Star.catalog('Vega');
    const events = starCrossings(vega, obs, MJD_START, MJD_END, 10.0);
    assert.ok(events.length >= 1);
    for (const e of events) {
      assert.ok(e.direction === 'rising' || e.direction === 'setting');
    }
  });
});

describe('starCulminations()', () => {
  it('finds Vega culminations', () => {
    const obs = Observer.roqueDeLasMuchachos();
    const vega = Star.catalog('Vega');
    const culms = starCulminations(vega, obs, MJD_START, MJD_END);
    assert.ok(culms.length >= 1);
  });
});

describe('starAboveThreshold()', () => {
  it('returns periods for Vega above 0°', () => {
    const obs = Observer.roqueDeLasMuchachos();
    const vega = Star.catalog('Vega');
    const periods = starAboveThreshold(vega, obs, MJD_START, MJD_END, 0.0);
    assert.ok(periods.length >= 1);
  });
});

describe('starBelowThreshold()', () => {
  it('returns periods for Vega below 0°', () => {
    const obs = Observer.roqueDeLasMuchachos();
    const vega = Star.catalog('Vega');
    const periods = starBelowThreshold(vega, obs, MJD_START, MJD_END, 0.0);
    assert.ok(periods.length >= 1);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// VSOP87 ephemeris
// ═══════════════════════════════════════════════════════════════════════════

describe('vsop87Heliocentric()', () => {
  it('returns Mars position at J2000', () => {
    const pos = vsop87Heliocentric('Mars', J2000_JD);
    assert.equal(pos.frame, 'EclipticMeanJ2000');
    assert.equal(pos.center, 'Heliocentric');
    // Mars is ~1.5 AU from the Sun
    const r = Math.sqrt(pos.x ** 2 + pos.y ** 2 + pos.z ** 2);
    assert.ok(r > 1.0 && r < 2.0, `Mars distance = ${r} AU`);
  });

  it('throws for unknown body', () => {
    assert.throws(() => vsop87Heliocentric('Pluto', J2000_JD));
  });
});

describe('vsop87Barycentric()', () => {
  it('returns Mercury barycentric position', () => {
    const pos = vsop87Barycentric('Mercury', J2000_JD);
    assert.equal(pos.center, 'Barycentric');
    assert.ok(Number.isFinite(pos.x));
  });
});

describe('vsop87SunBarycentric()', () => {
  it('returns Sun position near origin', () => {
    const pos = vsop87SunBarycentric(J2000_JD);
    const r = Math.sqrt(pos.x ** 2 + pos.y ** 2 + pos.z ** 2);
    assert.ok(r < 0.02, `Sun barycentric distance = ${r} AU, expected ~0`);
  });
});

describe('vsop87EarthBarycentric()', () => {
  it('returns Earth at ~1 AU from barycentre', () => {
    const pos = vsop87EarthBarycentric(J2000_JD);
    const r = Math.sqrt(pos.x ** 2 + pos.y ** 2 + pos.z ** 2);
    assert.ok(r > 0.9 && r < 1.1, `Earth distance = ${r} AU`);
  });
});

describe('vsop87EarthHeliocentric()', () => {
  it('returns Earth at ~1 AU from Sun', () => {
    const pos = vsop87EarthHeliocentric(J2000_JD);
    const r = Math.sqrt(pos.x ** 2 + pos.y ** 2 + pos.z ** 2);
    assert.ok(r > 0.9 && r < 1.1, `Earth distance = ${r} AU`);
    assert.equal(pos.center, 'Heliocentric');
  });
});

describe('vsop87MoonGeocentric()', () => {
  it('returns Moon at ~400 000 km from Earth', () => {
    const pos = vsop87MoonGeocentric(J2000_JD);
    const r = Math.sqrt(pos.x ** 2 + pos.y ** 2 + pos.z ** 2);
    assert.ok(r > 300_000 && r < 410_000, `Moon distance = ${r} km`);
    assert.equal(pos.center, 'Geocentric');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Coordinate transforms
// ═══════════════════════════════════════════════════════════════════════════

describe('transformDirection()', () => {
  it('ICRS → ICRS is identity', () => {
    const d = transformDirection(45.0, 90.0, 'ICRS', 'ICRS', J2000_JD);
    assert.ok(Math.abs(d.polarDeg - 45.0) < 1e-9);
    assert.ok(Math.abs(d.azimuthDeg - 90.0) < 1e-9);
    assert.equal(d.frame, 'ICRS');
  });

  it('EquatorialMeanJ2000 → EclipticMeanJ2000 produces valid output', () => {
    // Vega: RA=279.23°, Dec=38.78°
    const dir = transformDirection(38.78, 279.23, 'EquatorialMeanJ2000', 'EclipticMeanJ2000', J2000_JD);
    assert.ok(Number.isFinite(dir.polarDeg));
    assert.ok(Number.isFinite(dir.azimuthDeg));
    assert.equal(dir.frame, 'EclipticMeanJ2000');
  });

  it('throws for unknown frame', () => {
    assert.throws(
      () => transformDirection(0, 0, 'Bogus', 'ICRS', J2000_JD),
      /Unsupported/,
    );
  });
});

describe('directionToHorizontal()', () => {
  it('converts ICRS to Horizontal', () => {
    const obs = Observer.roqueDeLasMuchachos();
    const hz = directionToHorizontal(38.78, 279.23, 'ICRS', J2000_JD, obs);
    assert.ok(Number.isFinite(hz.polarDeg));
    assert.ok(Number.isFinite(hz.azimuthDeg));
    assert.equal(hz.frame, 'Horizontal');
  });
});

describe('geodeticToEcef()', () => {
  it('returns ECEF with magnitude ~6 371 km', () => {
    const obs = Observer.roqueDeLasMuchachos();
    const ecef = geodeticToEcef(obs);
    const r = Math.sqrt(ecef.x ** 2 + ecef.y ** 2 + ecef.z ** 2);
    // ~6 371 000 m ± 50 km
    assert.ok(r > 6_300_000 && r < 6_400_000, `ECEF radius = ${r} m`);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Moon phase
// ═══════════════════════════════════════════════════════════════════════════

describe('moonPhase()', () => {
  it('returns valid phase geometry at J2000', () => {
    const phase = moonPhase(J2000_JD);
    assert.ok(phase.phaseAngleDeg >= 0 && phase.phaseAngleDeg <= 360);
    assert.ok(phase.illuminatedFraction >= 0 && phase.illuminatedFraction <= 1);
    assert.ok(typeof phase.waxing === 'boolean');
    assert.ok(typeof phase.label === 'string');
  });
});

describe('moonPhaseTopocentric()', () => {
  it('returns phase geometry for an observer', () => {
    const obs = Observer.roqueDeLasMuchachos();
    const phase = moonPhaseTopocentric(J2000_JD, obs);
    assert.ok(phase.illuminatedFraction >= 0 && phase.illuminatedFraction <= 1);
  });
});

describe('findPhaseEvents()', () => {
  it('finds ~4 events in a lunar month', () => {
    const events = findPhaseEvents(MJD_START, MJD_START + 30);
    assert.ok(events.length >= 3 && events.length <= 5, `got ${events.length} events`);
    const validKinds = ['NewMoon', 'FirstQuarter', 'FullMoon', 'LastQuarter'];
    for (const e of events) {
      assert.ok(validKinds.includes(e.kind), `unexpected kind: ${e.kind}`);
      assert.ok(e.mjd >= MJD_START && e.mjd <= MJD_START + 30);
    }
  });

  it('validates window bounds', () => {
    assert.throws(() => findPhaseEvents(MJD_END, MJD_START));
  });
});

describe('moonIlluminationAbove()', () => {
  it('returns periods for k > 0.5', () => {
    const periods = moonIlluminationAbove(MJD_START, MJD_START + 30, 0.5);
    assert.ok(periods.length >= 1);
    for (const p of periods) {
      assert.ok(p.startMjd < p.endMjd);
    }
  });
});

describe('moonIlluminationBelow()', () => {
  it('returns periods for k < 0.3', () => {
    const periods = moonIlluminationBelow(MJD_START, MJD_START + 30, 0.3);
    assert.ok(periods.length >= 1);
  });
});

describe('moonIlluminationRange()', () => {
  it('returns periods for 0.4 ≤ k ≤ 0.6', () => {
    const periods = moonIlluminationRange(MJD_START, MJD_START + 30, 0.4, 0.6);
    assert.ok(periods.length >= 1);
  });
});
