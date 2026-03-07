// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Vallés Puig, Ramon

//! VSOP87 ephemeris — solar-system body positions at a given epoch.

use napi_derive::napi;

use siderust::bodies::solar_system::{
    Jupiter, Mars, Mercury, Neptune, Saturn, Uranus, Venus,
};
use siderust::calculus::ephemeris::{Ephemeris, Vsop87Ephemeris};
use siderust::time::JulianDate;

// ─────────────────────────────────────────────────────────────────────────────
// Result types
// ─────────────────────────────────────────────────────────────────────────────

/// A 3D Cartesian position with frame and center metadata.
#[napi(object)]
pub struct CartesianPosition {
    /// X coordinate (AU for solar-system, km for Moon geocentric).
    pub x: f64,
    /// Y coordinate.
    pub y: f64,
    /// Z coordinate.
    pub z: f64,
    /// Reference frame (e.g. `"EclipticMeanJ2000"`).
    pub frame: String,
    /// Reference center (e.g. `"Heliocentric"`, `"Barycentric"`, `"Geocentric"`).
    pub center: String,
}

// ─────────────────────────────────────────────────────────────────────────────
// VSOP87 queries
// ─────────────────────────────────────────────────────────────────────────────

/// Compute the heliocentric ecliptic position of a planet via VSOP87 (Series A).
///
/// Returns Cartesian coordinates in AU, in the EclipticMeanJ2000 frame,
/// centered on the Sun.
///
/// @param body — Planet name: Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune.
/// @param jd   — Julian Date of the epoch.
///
/// ```js
/// const { vsop87Heliocentric } = require('@siderust/siderust');
/// const mars = vsop87Heliocentric('Mars', 2451545.0);
/// console.log(mars.x, mars.y, mars.z);
/// ```
#[napi(js_name = "vsop87Heliocentric")]
pub fn vsop87_heliocentric(body: String, jd: f64) -> napi::Result<CartesianPosition> {
    if !jd.is_finite() {
        return Err(napi::Error::from_reason("jd must be finite"));
    }
    let t = JulianDate::new(jd);

    macro_rules! helio {
        ($planet:ty) => {{
            let pos = <$planet>::vsop87a(t);
            Ok(CartesianPosition {
                x: pos.x().value(),
                y: pos.y().value(),
                z: pos.z().value(),
                frame: "EclipticMeanJ2000".to_string(),
                center: "Heliocentric".to_string(),
            })
        }};
    }

    match body.as_str() {
        "Mercury" | "mercury" => helio!(Mercury),
        "Venus" | "venus" => helio!(Venus),
        "Mars" | "mars" => helio!(Mars),
        "Jupiter" | "jupiter" => helio!(Jupiter),
        "Saturn" | "saturn" => helio!(Saturn),
        "Uranus" | "uranus" => helio!(Uranus),
        "Neptune" | "neptune" => helio!(Neptune),
        _ => Err(napi::Error::from_reason(format!(
            "Unknown planet for VSOP87 heliocentric: \"{body}\". Valid: Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune.",
        ))),
    }
}

/// Compute the barycentric ecliptic position of a planet via VSOP87 (Series E).
///
/// Returns Cartesian coordinates in AU, in the EclipticMeanJ2000 frame,
/// centered on the solar-system barycentre.
///
/// @param body — Planet name or `"Sun"`.
/// @param jd   — Julian Date of the epoch.
#[napi(js_name = "vsop87Barycentric")]
pub fn vsop87_barycentric(body: String, jd: f64) -> napi::Result<CartesianPosition> {
    if !jd.is_finite() {
        return Err(napi::Error::from_reason("jd must be finite"));
    }
    let t = JulianDate::new(jd);

    macro_rules! bary {
        ($planet:ty) => {{
            let pos = <$planet>::vsop87e(t);
            Ok(CartesianPosition {
                x: pos.x().value(),
                y: pos.y().value(),
                z: pos.z().value(),
                frame: "EclipticMeanJ2000".to_string(),
                center: "Barycentric".to_string(),
            })
        }};
    }

    match body.as_str() {
        "Mercury" | "mercury" => bary!(Mercury),
        "Venus" | "venus" => bary!(Venus),
        "Mars" | "mars" => bary!(Mars),
        "Jupiter" | "jupiter" => bary!(Jupiter),
        "Saturn" | "saturn" => bary!(Saturn),
        "Uranus" | "uranus" => bary!(Uranus),
        "Neptune" | "neptune" => bary!(Neptune),
        _ => Err(napi::Error::from_reason(format!(
            "Unknown planet for VSOP87 barycentric: \"{body}\". Valid: Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune.",
        ))),
    }
}

/// Get the Sun's barycentric position via VSOP87.
///
/// @param jd — Julian Date.
/// @returns Cartesian position in AU (EclipticMeanJ2000, Barycentric).
#[napi(js_name = "vsop87SunBarycentric")]
pub fn vsop87_sun_barycentric(jd: f64) -> napi::Result<CartesianPosition> {
    if !jd.is_finite() {
        return Err(napi::Error::from_reason("jd must be finite"));
    }
    let t = JulianDate::new(jd);
    let pos = Vsop87Ephemeris::sun_barycentric(t);
    Ok(CartesianPosition {
        x: pos.x().value(),
        y: pos.y().value(),
        z: pos.z().value(),
        frame: "EclipticMeanJ2000".to_string(),
        center: "Barycentric".to_string(),
    })
}

/// Get the Earth's barycentric position via VSOP87.
///
/// @param jd — Julian Date.
/// @returns Cartesian position in AU (EclipticMeanJ2000, Barycentric).
#[napi(js_name = "vsop87EarthBarycentric")]
pub fn vsop87_earth_barycentric(jd: f64) -> napi::Result<CartesianPosition> {
    if !jd.is_finite() {
        return Err(napi::Error::from_reason("jd must be finite"));
    }
    let t = JulianDate::new(jd);
    let pos = Vsop87Ephemeris::earth_barycentric(t);
    Ok(CartesianPosition {
        x: pos.x().value(),
        y: pos.y().value(),
        z: pos.z().value(),
        frame: "EclipticMeanJ2000".to_string(),
        center: "Barycentric".to_string(),
    })
}

/// Get the Earth's heliocentric position via VSOP87.
///
/// @param jd — Julian Date.
/// @returns Cartesian position in AU (EclipticMeanJ2000, Heliocentric).
#[napi(js_name = "vsop87EarthHeliocentric")]
pub fn vsop87_earth_heliocentric(jd: f64) -> napi::Result<CartesianPosition> {
    if !jd.is_finite() {
        return Err(napi::Error::from_reason("jd must be finite"));
    }
    let t = JulianDate::new(jd);
    let pos = Vsop87Ephemeris::earth_heliocentric(t);
    Ok(CartesianPosition {
        x: pos.x().value(),
        y: pos.y().value(),
        z: pos.z().value(),
        frame: "EclipticMeanJ2000".to_string(),
        center: "Heliocentric".to_string(),
    })
}

/// Get the Moon's geocentric position via ELP2000.
///
/// @param jd — Julian Date.
/// @returns Cartesian position in **km** (EclipticMeanJ2000, Geocentric).
#[napi(js_name = "vsop87MoonGeocentric")]
pub fn vsop87_moon_geocentric(jd: f64) -> napi::Result<CartesianPosition> {
    if !jd.is_finite() {
        return Err(napi::Error::from_reason("jd must be finite"));
    }
    let t = JulianDate::new(jd);
    let pos = Vsop87Ephemeris::moon_geocentric(t);
    Ok(CartesianPosition {
        x: pos.x().value(),
        y: pos.y().value(),
        z: pos.z().value(),
        frame: "EclipticMeanJ2000".to_string(),
        center: "Geocentric".to_string(),
    })
}
