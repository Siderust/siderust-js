// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Vallés Puig, Ramon

//! Solar-system body identifiers and planet data.

use serde::Serialize;
use wasm_bindgen::prelude::*;

// Re-export shared types from the binding core.
pub(crate) use siderust_binding_core::body::BodyKind;

/// Convert a body name string to BodyKind, mapping errors to JsError.
pub(crate) fn parse_body(s: &str) -> Result<BodyKind, JsError> {
    BodyKind::from_str(s).map_err(|e| JsError::new(&e))
}

// ─────────────────────────────────────────────────────────────────────────────
// Planet info
// ─────────────────────────────────────────────────────────────────────────────

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PlanetInfo {
    pub name: String,
    pub mass_kg: f64,
    pub radius_km: f64,
    pub semi_major_axis_au: f64,
    pub eccentricity: f64,
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
#[wasm_bindgen(js_name = "getPlanet")]
pub fn get_planet(name: &str) -> Result<JsValue, JsError> {
    let info: PlanetInfo = siderust_binding_core::body::get_planet_info(name)
        .map(PlanetInfo::from)
        .ok_or_else(|| JsError::new(&format!(
            "Unknown planet: \"{name}\". Valid: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune."
        )))?;
    to_js(&info)
}

/// List the names of all available solar-system bodies.
#[wasm_bindgen(js_name = "listBodies")]
pub fn list_bodies() -> JsValue {
    serde_wasm_bindgen::to_value(BodyKind::all_names()).unwrap()
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

pub(crate) fn to_js<T: Serialize>(val: &T) -> Result<JsValue, JsError> {
    serde_wasm_bindgen::to_value(val).map_err(|e| JsError::new(&e.to_string()))
}
