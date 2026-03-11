// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Vallés Puig, Ramon

//! Solar-system body dispatch logic shared between Node and Web bindings.

use siderust::bodies::Planet;
use siderust::bodies::solar_system;

/// Solar-system body enumeration for dispatch.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum BodyKind {
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
    /// Parse a body name string into a BodyKind.
    /// Returns `Err(error_message)` if the name is unknown.
    pub fn from_str(s: &str) -> Result<Self, String> {
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
            _ => Err(format!(
                "Unknown body: \"{s}\". Valid: Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune."
            )),
        }
    }

    /// Get the display name for this body.
    pub fn name(&self) -> &'static str {
        match self {
            Self::Sun => "Sun",
            Self::Moon => "Moon",
            Self::Mercury => "Mercury",
            Self::Venus => "Venus",
            Self::Mars => "Mars",
            Self::Jupiter => "Jupiter",
            Self::Saturn => "Saturn",
            Self::Uranus => "Uranus",
            Self::Neptune => "Neptune",
        }
    }

    /// List all available body names.
    pub fn all_names() -> &'static [&'static str] {
        &["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune"]
    }
}

/// Dispatch a BodyKind to a concrete siderust body type and execute an operation.
#[macro_export]
macro_rules! dispatch_body {
    ($kind:expr, |$b:ident| $op:expr ) => {
        match $kind {
            $crate::body::BodyKind::Sun     => { let $b = siderust::bodies::solar_system::Sun;     $op }
            $crate::body::BodyKind::Moon    => { let $b = siderust::bodies::solar_system::Moon;    $op }
            $crate::body::BodyKind::Mercury => { let $b = siderust::bodies::solar_system::Mercury; $op }
            $crate::body::BodyKind::Venus   => { let $b = siderust::bodies::solar_system::Venus;   $op }
            $crate::body::BodyKind::Mars    => { let $b = siderust::bodies::solar_system::Mars;    $op }
            $crate::body::BodyKind::Jupiter => { let $b = siderust::bodies::solar_system::Jupiter; $op }
            $crate::body::BodyKind::Saturn  => { let $b = siderust::bodies::solar_system::Saturn;  $op }
            $crate::body::BodyKind::Uranus  => { let $b = siderust::bodies::solar_system::Uranus;  $op }
            $crate::body::BodyKind::Neptune => { let $b = siderust::bodies::solar_system::Neptune; $op }
        }
    };
}

/// Physical parameters of a solar-system planet (plain data).
#[derive(Debug, Clone)]
pub struct PlanetInfo {
    pub name: String,
    pub mass_kg: f64,
    pub radius_km: f64,
    pub semi_major_axis_au: f64,
    pub eccentricity: f64,
    pub inclination_deg: f64,
}

impl PlanetInfo {
    /// Create PlanetInfo from a siderust Planet reference.
    pub fn from_planet(name: &str, p: &Planet) -> Self {
        Self {
            name: name.to_string(),
            mass_kg: p.mass.value(),
            radius_km: p.radius.value(),
            semi_major_axis_au: p.orbit.semi_major_axis.value(),
            eccentricity: p.orbit.eccentricity,
            inclination_deg: p.orbit.inclination.value(),
        }
    }
}

/// Get planet info by name. Returns None for non-planet bodies.
pub fn get_planet_info(name: &str) -> Option<PlanetInfo> {
    match name {
        "Mercury" | "mercury" => Some(PlanetInfo::from_planet("Mercury", &solar_system::MERCURY)),
        "Venus" | "venus" => Some(PlanetInfo::from_planet("Venus", &solar_system::VENUS)),
        "Earth" | "earth" => Some(PlanetInfo::from_planet("Earth", &solar_system::EARTH)),
        "Mars" | "mars" => Some(PlanetInfo::from_planet("Mars", &solar_system::MARS)),
        "Jupiter" | "jupiter" => Some(PlanetInfo::from_planet("Jupiter", &solar_system::JUPITER)),
        "Saturn" | "saturn" => Some(PlanetInfo::from_planet("Saturn", &solar_system::SATURN)),
        "Uranus" | "uranus" => Some(PlanetInfo::from_planet("Uranus", &solar_system::URANUS)),
        "Neptune" | "neptune" => Some(PlanetInfo::from_planet("Neptune", &solar_system::NEPTUNE)),
        _ => None,
    }
}
