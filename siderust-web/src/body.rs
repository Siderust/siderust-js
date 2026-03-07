// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Vallés Puig, Ramon

//! Solar-system body identifiers and planet data.

use serde::Serialize;
use wasm_bindgen::prelude::*;

use siderust::bodies::solar_system;
use siderust::bodies::Planet;

// ─────────────────────────────────────────────────────────────────────────────
// Body dispatch
// ─────────────────────────────────────────────────────────────────────────────

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
    pub(crate) fn from_str(s: &str) -> Result<Self, JsError> {
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
            _ => Err(JsError::new(&format!(
                "Unknown body: \"{s}\". Valid: Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune."
            ))),
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// dispatch macro
// ─────────────────────────────────────────────────────────────────────────────

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
#[wasm_bindgen(js_name = "getPlanet")]
pub fn get_planet(name: &str) -> Result<JsValue, JsError> {
    let info = match name {
        "Mercury" | "mercury" => planet_info("Mercury", &solar_system::MERCURY),
        "Venus" | "venus" => planet_info("Venus", &solar_system::VENUS),
        "Earth" | "earth" => planet_info("Earth", &solar_system::EARTH),
        "Mars" | "mars" => planet_info("Mars", &solar_system::MARS),
        "Jupiter" | "jupiter" => planet_info("Jupiter", &solar_system::JUPITER),
        "Saturn" | "saturn" => planet_info("Saturn", &solar_system::SATURN),
        "Uranus" | "uranus" => planet_info("Uranus", &solar_system::URANUS),
        "Neptune" | "neptune" => planet_info("Neptune", &solar_system::NEPTUNE),
        _ => {
            return Err(JsError::new(&format!(
                "Unknown planet: \"{name}\". Valid: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune."
            )));
        }
    };
    to_js(&info)
}

/// List the names of all available solar-system bodies.
#[wasm_bindgen(js_name = "listBodies")]
pub fn list_bodies() -> JsValue {
    let bodies: Vec<&str> = vec![
        "Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune",
    ];
    serde_wasm_bindgen::to_value(&bodies).unwrap()
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

pub(crate) fn to_js<T: Serialize>(val: &T) -> Result<JsValue, JsError> {
    serde_wasm_bindgen::to_value(val).map_err(|e| JsError::new(&e.to_string()))
}
