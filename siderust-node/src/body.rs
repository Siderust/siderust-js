// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Vallés Puig, Ramon

//! Solar-system body identifiers and planet data.

use napi_derive::napi;

use siderust::bodies::solar_system;
use siderust::bodies::Planet;

// ─────────────────────────────────────────────────────────────────────────────
// Body enum exposed as string constants
// ─────────────────────────────────────────────────────────────────────────────

/// Solar-system body names accepted by altitude/azimuth/ephemeris functions.
///
/// Use as plain strings: `"Sun"`, `"Moon"`, `"Mercury"`, `"Venus"`, `"Mars"`,
/// `"Jupiter"`, `"Saturn"`, `"Uranus"`, `"Neptune"`.
///
/// These map internally to the `siderust::bodies::solar_system` unit types.

/// Parse a body name string into a body enum variant for internal dispatch.
pub(crate) enum BodyKind {
    Sun,
    Moon,
    Mercury,
    Venus,
    Mars,
    Jupiter,
    Saturn,
    Uranus,
    Neptune,
}

impl BodyKind {
    pub(crate) fn from_str(s: &str) -> napi::Result<Self> {
        match s {
            "Sun" | "sun" => Ok(Self::Sun),
            "Moon" | "moon" => Ok(Self::Moon),
            "Mercury" | "mercury" => Ok(Self::Mercury),
            "Venus" | "venus" => Ok(Self::Venus),
            "Mars" | "mars" => Ok(Self::Mars),
            "Jupiter" | "jupiter" => Ok(Self::Jupiter),
            "Saturn" | "saturn" => Ok(Self::Saturn),
            "Uranus" | "uranus" => Ok(Self::Uranus),
            "Neptune" | "neptune" => Ok(Self::Neptune),
            _ => Err(napi::Error::from_reason(format!(
                "Unknown body: \"{s}\". Valid: Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune."
            ))),
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// dispatch macro — runs a closure on the concrete unit type
// ─────────────────────────────────────────────────────────────────────────────

/// Dispatch a body string to the concrete siderust unit type and call `$op`.
///
/// `$op` must accept *any* concrete body type (monomorphised).  The parameter
/// names inside the callbacks are intentionally unused in the macro expansion;
/// callers use the `|b|` binding.
macro_rules! dispatch_body {
    ($kind:expr, |$b:ident| $op:expr ) => {
        match $kind {
            BodyKind::Sun     => { let $b = siderust::bodies::solar_system::Sun;     $op }
            BodyKind::Moon    => { let $b = siderust::bodies::solar_system::Moon;    $op }
            BodyKind::Mercury => { let $b = siderust::bodies::solar_system::Mercury; $op }
            BodyKind::Venus   => { let $b = siderust::bodies::solar_system::Venus;   $op }
            BodyKind::Mars    => { let $b = siderust::bodies::solar_system::Mars;    $op }
            BodyKind::Jupiter => { let $b = siderust::bodies::solar_system::Jupiter; $op }
            BodyKind::Saturn  => { let $b = siderust::bodies::solar_system::Saturn;  $op }
            BodyKind::Uranus  => { let $b = siderust::bodies::solar_system::Uranus;  $op }
            BodyKind::Neptune => { let $b = siderust::bodies::solar_system::Neptune; $op }
        }
    };
}

pub(crate) use dispatch_body;

// ─────────────────────────────────────────────────────────────────────────────
// Planet info (value object)
// ─────────────────────────────────────────────────────────────────────────────

/// Physical parameters of a solar-system planet.
#[napi(object)]
pub struct PlanetInfo {
    /// Planet name.
    pub name: String,
    /// Mass in kilograms.
    pub mass_kg: f64,
    /// Mean equatorial radius in kilometres.
    pub radius_km: f64,
    /// Semi-major axis in AU.
    pub semi_major_axis_au: f64,
    /// Orbital eccentricity.
    pub eccentricity: f64,
    /// Orbital inclination in degrees.
    pub inclination_deg: f64,
}

fn planet_info(name: &str, p: &Planet) -> PlanetInfo {
    PlanetInfo {
        name: name.to_string(),
        mass_kg: p.mass.value(),
        radius_km: p.radius.value(),
        semi_major_axis_au: p.orbit.semi_major_axis.value(),
        eccentricity: p.orbit.eccentricity,
        inclination_deg: p.orbit.inclination.value(),
    }
}

/// Get physical parameters for a named planet.
///
/// Valid names: `"Mercury"`, `"Venus"`, `"Earth"`, `"Mars"`, `"Jupiter"`,
/// `"Saturn"`, `"Uranus"`, `"Neptune"`.
///
/// ```js
/// const { getPlanet } = require('@siderust/siderust');
/// const mars = getPlanet('Mars');
/// console.log(mars.massKg, mars.radiusKm);
/// ```
#[napi(js_name = "getPlanet")]
pub fn get_planet(name: String) -> napi::Result<PlanetInfo> {
    match name.as_str() {
        "Mercury" | "mercury" => Ok(planet_info("Mercury", &solar_system::MERCURY)),
        "Venus" | "venus" => Ok(planet_info("Venus", &solar_system::VENUS)),
        "Earth" | "earth" => Ok(planet_info("Earth", &solar_system::EARTH)),
        "Mars" | "mars" => Ok(planet_info("Mars", &solar_system::MARS)),
        "Jupiter" | "jupiter" => Ok(planet_info("Jupiter", &solar_system::JUPITER)),
        "Saturn" | "saturn" => Ok(planet_info("Saturn", &solar_system::SATURN)),
        "Uranus" | "uranus" => Ok(planet_info("Uranus", &solar_system::URANUS)),
        "Neptune" | "neptune" => Ok(planet_info("Neptune", &solar_system::NEPTUNE)),
        _ => Err(napi::Error::from_reason(format!(
            "Unknown planet: \"{name}\". Valid: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune."
        ))),
    }
}

/// List the names of all available solar-system bodies for altitude/azimuth queries.
#[napi(js_name = "listBodies")]
pub fn list_bodies() -> Vec<String> {
    vec![
        "Sun".into(),
        "Moon".into(),
        "Mercury".into(),
        "Venus".into(),
        "Mars".into(),
        "Jupiter".into(),
        "Saturn".into(),
        "Uranus".into(),
        "Neptune".into(),
    ]
}
