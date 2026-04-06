import { before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { init as initQtty, Quantity } from "@siderust/qtty-web";
import {
  init as initTempoch,
  JulianDate,
  ModifiedJulianDate,
  Period,
} from "@siderust/tempoch-web";

import {
  init,
  Observer,
  Star,
  bodyAltitudeAt,
  bodyCrossings,
  moonPhase,
  transformDirection,
  vsop87Heliocentric,
} from "../index.js";

const qttyWasm = new URL(
  "../../qtty-js/qtty-web/pkg/qtty_web_bg.wasm",
  import.meta.url,
);
const tempochWasm = new URL(
  "../../tempoch-js/tempoch-web/pkg/tempoch_web_bg.wasm",
  import.meta.url,
);
const siderustWasm = new URL("../pkg/siderust_web_bg.wasm", import.meta.url);

const DEG = (value) => new Quantity(value, "Degree");
const M = (value) => new Quantity(value, "Meter");
const LY = (value) => new Quantity(value, "LightYear");
const SOLAR_MASS = (value) => new Quantity(value, "SolarMass");
const SOLAR_RADIUS = (value) => new Quantity(value, "NominalSolarRadius");
const SOLAR_LUMINOSITY = (value) => new Quantity(value, "SolarLuminosity");

before(async () => {
  await initQtty(await readFile(qttyWasm));
  await initTempoch(await readFile(tempochWasm));
  await init(await readFile(siderustWasm));
});

describe("@siderust/siderust-web typed API", () => {
  it("constructs typed observer and star objects", () => {
    const observer = new Observer(DEG(-17.8925), DEG(28.7543), M(2396));
    const star = new Star(
      "TypedStar",
      LY(100),
      SOLAR_MASS(2),
      SOLAR_RADIUS(1.5),
      SOLAR_LUMINOSITY(8),
      DEG(180),
      DEG(-45),
    );

    assert.equal(observer.lon.unit, "Degree");
    assert.equal(observer.height.unit, "Meter");
    assert.equal(star.distance.unit, "LightYear");
    assert.equal(star.ra.unit, "Degree");
  });

  it("rejects raw numbers", () => {
    assert.throws(
      () => new Observer(-17.8925, 28.7543, 2396),
      /expected a Quantity/,
    );
    assert.throws(
      () => vsop87Heliocentric("Mars", 2_451_545.0),
      /Expected a JulianDate/,
    );
  });

  it("returns typed direction and position results", () => {
    const direction = transformDirection(
      DEG(38.78),
      DEG(279.23),
      "EquatorialMeanJ2000",
      "EclipticMeanJ2000",
      new JulianDate(2_451_545.0),
    );
    const mars = vsop87Heliocentric("Mars", new JulianDate(2_451_545.0));

    assert.equal(direction.polar.unit, "Degree");
    assert.equal(direction.azimuth.unit, "Degree");
    assert.equal(mars.x.unit, "AstronomicalUnit");
    assert.equal(mars.center, "Heliocentric");
  });

  it("returns typed event values", () => {
    const observer = Observer.roqueDeLasMuchachos();
    const window = new Period(
      new ModifiedJulianDate(60_000.0),
      new ModifiedJulianDate(60_001.0),
    );
    const altitude = bodyAltitudeAt(
      "Sun",
      observer,
      new ModifiedJulianDate(60_000.0),
    );
    const crossings = bodyCrossings("Sun", observer, window, DEG(0));

    assert.equal(altitude.unit, "Degree");
    for (const event of crossings) {
      assert.ok(event.mjd instanceof ModifiedJulianDate);
    }
  });

  it("returns typed moon phase values", () => {
    const phase = moonPhase(new JulianDate(2_451_545.0));
    assert.equal(phase.phaseAngle.unit, "Degree");
    assert.equal(phase.elongation.unit, "Degree");
    assert.equal(typeof phase.illuminatedFraction, "number");
  });
});
