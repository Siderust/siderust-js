// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Vallés Puig, Ramon

//! Solar-system body identifiers and planet data.

use napi_derive::napi;

// Re-export shared types from the binding core.
pub(crate) use siderust_binding_core::body::BodyKind;

/// Convert a body name string to BodyKind, mapping errors to napi::Error.
pub(crate) fn parse_body(s: &str) -> napi::Result<BodyKind> {
    BodyKind::from_str(s).map_err(napi::Error::from_reason)
}

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

impl From<siderust_binding_core::body::PlanetInfo> for PlanetInfo {
    fn from(p: siderust_binding_core::body::PlanetInfo) -> Self {
        Self {
            name: p.name,
            mass_kg: p.mass_kg,
            radius_km: p.radius_km,
            semi_major_axis_au: p.semi_major_axis_au,
            eccentricity: p.eccentricity,
            inclination_deg: p.inclination_deg,
        }
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
    siderust_binding_core::body::get_planet_info(&name)
        .map(PlanetInfo::from)
        .ok_or_else(|| napi::Error::from_reason(format!(
            "Unknown planet: \"{name}\". Valid: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune."
        )))
}

/// List the names of all available solar-system bodies for altitude/azimuth queries.
#[napi(js_name = "listBodies")]
pub fn list_bodies() -> Vec<String> {
    BodyKind::all_names().iter().map(|s| s.to_string()).collect()
}
