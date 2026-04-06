// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Vallés Puig, Ramon

//! Star validation and catalog helpers shared between Node and Web bindings.

use std::borrow::Cow;

use qtty::length::nominal::SolarRadiuses;
use qtty::*;
use siderust::bodies::{self, Star as SiderustStar};
use siderust::coordinates::centers::Geocentric;
use siderust::coordinates::frames::EquatorialMeanJ2000;
use siderust::coordinates::spherical;
use siderust::targets::CoordinateWithPM;
use tempoch::JulianDate;

pub const CATALOG_STAR_NAMES: &[&str] = &[
    "Vega",
    "Sirius",
    "Polaris",
    "Canopus",
    "Arcturus",
    "Rigel",
    "Betelgeuse",
    "Procyon",
    "Aldebaran",
    "Altair",
];

pub fn validate_star_params(
    distance_ly: f64,
    mass_solar: f64,
    radius_solar: f64,
    luminosity_solar: f64,
    ra_deg: f64,
    dec_deg: f64,
) -> Result<(), String> {
    for (label, value) in [
        ("distanceLy", distance_ly),
        ("massSolar", mass_solar),
        ("radiusSolar", radius_solar),
        ("luminositySolar", luminosity_solar),
        ("raDeg", ra_deg),
        ("decDeg", dec_deg),
    ] {
        if !value.is_finite() {
            return Err(format!("{label} must be finite (not NaN or ±infinity)"));
        }
    }
    Ok(())
}

pub fn create_star(
    name: impl Into<String>,
    distance_ly: f64,
    mass_solar: f64,
    radius_solar: f64,
    luminosity_solar: f64,
    ra_deg: f64,
    dec_deg: f64,
) -> Result<SiderustStar<'static>, String> {
    validate_star_params(
        distance_ly,
        mass_solar,
        radius_solar,
        luminosity_solar,
        ra_deg,
        dec_deg,
    )?;

    let pos = spherical::Position::<Geocentric, EquatorialMeanJ2000, LightYear>::new(
        Degrees::new(ra_deg),
        Degrees::new(dec_deg),
        LightYears::new(distance_ly),
    );
    let target = CoordinateWithPM::<
        spherical::Position<Geocentric, EquatorialMeanJ2000, LightYear>,
    >::new_static(pos, JulianDate::J2000);

    Ok(SiderustStar::new(
        Cow::<'static, str>::Owned(name.into()),
        LightYears::new(distance_ly),
        SolarMasses::new(mass_solar),
        SolarRadiuses::new(radius_solar),
        SolarLuminosities::new(luminosity_solar),
        target,
    ))
}

pub fn catalog_star(name: &str) -> Result<SiderustStar<'static>, String> {
    let star: &SiderustStar<'static> = match name.to_uppercase().as_str() {
        "VEGA" => &bodies::VEGA,
        "SIRIUS" => &bodies::SIRIUS,
        "POLARIS" => &bodies::POLARIS,
        "CANOPUS" => &bodies::CANOPUS,
        "ARCTURUS" => &bodies::ARCTURUS,
        "RIGEL" => &bodies::RIGEL,
        "BETELGEUSE" => &bodies::BETELGEUSE,
        "PROCYON" => &bodies::PROCYON,
        "ALDEBARAN" => &bodies::ALDEBARAN,
        "ALTAIR" => &bodies::ALTAIR,
        _ => {
            return Err(format!(
                "Unknown catalog star: \"{name}\". Available: {}.",
                CATALOG_STAR_NAMES.join(", ")
            ));
        }
    };
    Ok(star.clone())
}

pub fn list_catalog_star_names() -> Vec<String> {
    CATALOG_STAR_NAMES.iter().map(|name| (*name).to_string()).collect()
}
