// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Vallés Puig, Ramon

//! VSOP87 ephemeris — solar-system body positions at a given epoch.

use serde::Serialize;
use wasm_bindgen::prelude::*;

use crate::body::to_js;

use qtty::*;
use siderust::bodies::solar_system::{
    Earth, Jupiter, Mars, Mercury, Neptune, Saturn, Uranus, Venus,
};
use siderust::calculus::ephemeris::{Ephemeris, Vsop87Ephemeris};
use siderust::coordinates::cartesian::position::EclipticMeanJ2000;
use siderust::coordinates::centers::{Barycentric, Geocentric, Heliocentric};
use siderust::coordinates::transform::TransformCenter;
use siderust::time::JulianDate;

// ─────────────────────────────────────────────────────────────────────────────
// Result types
// ─────────────────────────────────────────────────────────────────────────────

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CartesianPosition {
    pub x: f64,
    pub y: f64,
    pub z: f64,
    pub frame: String,
    pub center: String,
}

// ─────────────────────────────────────────────────────────────────────────────
// VSOP87 queries
// ─────────────────────────────────────────────────────────────────────────────

/// Compute the heliocentric ecliptic position of a planet via VSOP87 (Series A).
#[wasm_bindgen(js_name = "vsop87Heliocentric")]
pub fn vsop87_heliocentric(body: &str, jd: f64) -> Result<JsValue, JsError> {
    if !jd.is_finite() {
        return Err(JsError::new("jd must be finite"));
    }
    let t = JulianDate::new(jd);

    macro_rules! helio {
        ($planet:ty) => {{
            let pos = <$planet>::vsop87a(t);
            to_js(&CartesianPosition {
                x: pos.x().value(),
                y: pos.y().value(),
                z: pos.z().value(),
                frame: "EclipticMeanJ2000".to_string(),
                center: "Heliocentric".to_string(),
            })
        }};
    }

    match body {
        "Mercury" | "mercury" => helio!(Mercury),
        "Venus" | "venus" => helio!(Venus),
        "Earth" | "earth" => helio!(Earth),
        "Mars" | "mars" => helio!(Mars),
        "Jupiter" | "jupiter" => helio!(Jupiter),
        "Saturn" | "saturn" => helio!(Saturn),
        "Uranus" | "uranus" => helio!(Uranus),
        "Neptune" | "neptune" => helio!(Neptune),
        _ => Err(JsError::new(&format!(
            "Unknown planet for VSOP87 heliocentric: \"{body}\". Valid: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune.",
        ))),
    }
}

/// Compute the barycentric ecliptic position of a planet via VSOP87 (Series E).
#[wasm_bindgen(js_name = "vsop87Barycentric")]
pub fn vsop87_barycentric(body: &str, jd: f64) -> Result<JsValue, JsError> {
    if !jd.is_finite() {
        return Err(JsError::new("jd must be finite"));
    }
    let t = JulianDate::new(jd);

    macro_rules! bary {
        ($planet:ty) => {{
            let pos = <$planet>::vsop87e(t);
            to_js(&CartesianPosition {
                x: pos.x().value(),
                y: pos.y().value(),
                z: pos.z().value(),
                frame: "EclipticMeanJ2000".to_string(),
                center: "Barycentric".to_string(),
            })
        }};
    }

    match body {
        "Mercury" | "mercury" => bary!(Mercury),
        "Venus" | "venus" => bary!(Venus),
        "Earth" | "earth" => bary!(Earth),
        "Mars" | "mars" => bary!(Mars),
        "Jupiter" | "jupiter" => bary!(Jupiter),
        "Saturn" | "saturn" => bary!(Saturn),
        "Uranus" | "uranus" => bary!(Uranus),
        "Neptune" | "neptune" => bary!(Neptune),
        _ => Err(JsError::new(&format!(
            "Unknown planet for VSOP87 barycentric: \"{body}\". Valid: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune.",
        ))),
    }
}

/// Get the Sun's barycentric position via VSOP87.
#[wasm_bindgen(js_name = "vsop87SunBarycentric")]
pub fn vsop87_sun_barycentric(jd: f64) -> Result<JsValue, JsError> {
    if !jd.is_finite() {
        return Err(JsError::new("jd must be finite"));
    }
    let t = JulianDate::new(jd);
    let pos = Vsop87Ephemeris::sun_barycentric(t);
    to_js(&CartesianPosition {
        x: pos.x().value(),
        y: pos.y().value(),
        z: pos.z().value(),
        frame: "EclipticMeanJ2000".to_string(),
        center: "Barycentric".to_string(),
    })
}

/// Get the Earth's barycentric position via VSOP87.
#[wasm_bindgen(js_name = "vsop87EarthBarycentric")]
pub fn vsop87_earth_barycentric(jd: f64) -> Result<JsValue, JsError> {
    if !jd.is_finite() {
        return Err(JsError::new("jd must be finite"));
    }
    let t = JulianDate::new(jd);
    let pos = Vsop87Ephemeris::earth_barycentric(t);
    to_js(&CartesianPosition {
        x: pos.x().value(),
        y: pos.y().value(),
        z: pos.z().value(),
        frame: "EclipticMeanJ2000".to_string(),
        center: "Barycentric".to_string(),
    })
}

/// Get the Earth's heliocentric position via VSOP87.
#[wasm_bindgen(js_name = "vsop87EarthHeliocentric")]
pub fn vsop87_earth_heliocentric(jd: f64) -> Result<JsValue, JsError> {
    if !jd.is_finite() {
        return Err(JsError::new("jd must be finite"));
    }
    let t = JulianDate::new(jd);
    let pos = Vsop87Ephemeris::earth_heliocentric(t);
    to_js(&CartesianPosition {
        x: pos.x().value(),
        y: pos.y().value(),
        z: pos.z().value(),
        frame: "EclipticMeanJ2000".to_string(),
        center: "Heliocentric".to_string(),
    })
}

/// Get the Moon's geocentric position via ELP2000.
#[wasm_bindgen(js_name = "vsop87MoonGeocentric")]
pub fn vsop87_moon_geocentric(jd: f64) -> Result<JsValue, JsError> {
    if !jd.is_finite() {
        return Err(JsError::new("jd must be finite"));
    }
    let t = JulianDate::new(jd);
    let pos = Vsop87Ephemeris::moon_geocentric(t);
    to_js(&CartesianPosition {
        x: pos.x().value(),
        y: pos.y().value(),
        z: pos.z().value(),
        frame: "EclipticMeanJ2000".to_string(),
        center: "Geocentric".to_string(),
    })
}

// ─────────────────────────────────────────────────────────────────────────────
// Center transforms
// ─────────────────────────────────────────────────────────────────────────────

/// Transform a Cartesian position from one reference center to another.
#[wasm_bindgen(js_name = "transformPositionCenter")]
pub fn transform_position_center(
    x: f64,
    y: f64,
    z: f64,
    src_center: &str,
    dst_center: &str,
    jd: f64,
) -> Result<JsValue, JsError> {
    if !x.is_finite() || !y.is_finite() || !z.is_finite() || !jd.is_finite() {
        return Err(JsError::new("x, y, z and jd must be finite"));
    }
    let t = JulianDate::new(jd);

    match (src_center, dst_center) {
        (s, d) if s == d => to_js(&CartesianPosition {
            x,
            y,
            z,
            frame: "EclipticMeanJ2000".to_string(),
            center: dst_center.to_string(),
        }),
        ("Heliocentric", "Geocentric") => {
            let pos = EclipticMeanJ2000::<AstronomicalUnit, Heliocentric>::new(x, y, z);
            let out: EclipticMeanJ2000<AstronomicalUnit, Geocentric> = pos.to_center(t);
            to_js(&CartesianPosition {
                x: out.x().value(),
                y: out.y().value(),
                z: out.z().value(),
                frame: "EclipticMeanJ2000".to_string(),
                center: "Geocentric".to_string(),
            })
        }
        ("Geocentric", "Heliocentric") => {
            let pos = EclipticMeanJ2000::<AstronomicalUnit, Geocentric>::new(x, y, z);
            let out: EclipticMeanJ2000<AstronomicalUnit, Heliocentric> = pos.to_center(t);
            to_js(&CartesianPosition {
                x: out.x().value(),
                y: out.y().value(),
                z: out.z().value(),
                frame: "EclipticMeanJ2000".to_string(),
                center: "Heliocentric".to_string(),
            })
        }
        ("Heliocentric", "Barycentric") => {
            let pos = EclipticMeanJ2000::<AstronomicalUnit, Heliocentric>::new(x, y, z);
            let out: EclipticMeanJ2000<AstronomicalUnit, Barycentric> = pos.to_center(t);
            to_js(&CartesianPosition {
                x: out.x().value(),
                y: out.y().value(),
                z: out.z().value(),
                frame: "EclipticMeanJ2000".to_string(),
                center: "Barycentric".to_string(),
            })
        }
        ("Barycentric", "Heliocentric") => {
            let pos = EclipticMeanJ2000::<AstronomicalUnit, Barycentric>::new(x, y, z);
            let out: EclipticMeanJ2000<AstronomicalUnit, Heliocentric> = pos.to_center(t);
            to_js(&CartesianPosition {
                x: out.x().value(),
                y: out.y().value(),
                z: out.z().value(),
                frame: "EclipticMeanJ2000".to_string(),
                center: "Heliocentric".to_string(),
            })
        }
        ("Barycentric", "Geocentric") => {
            let pos = EclipticMeanJ2000::<AstronomicalUnit, Barycentric>::new(x, y, z);
            let out: EclipticMeanJ2000<AstronomicalUnit, Geocentric> = pos.to_center(t);
            to_js(&CartesianPosition {
                x: out.x().value(),
                y: out.y().value(),
                z: out.z().value(),
                frame: "EclipticMeanJ2000".to_string(),
                center: "Geocentric".to_string(),
            })
        }
        ("Geocentric", "Barycentric") => {
            let pos = EclipticMeanJ2000::<AstronomicalUnit, Geocentric>::new(x, y, z);
            let out: EclipticMeanJ2000<AstronomicalUnit, Barycentric> = pos.to_center(t);
            to_js(&CartesianPosition {
                x: out.x().value(),
                y: out.y().value(),
                z: out.z().value(),
                frame: "EclipticMeanJ2000".to_string(),
                center: "Barycentric".to_string(),
            })
        }
        _ => Err(JsError::new(&format!(
            "Unsupported center transform: \"{}\" → \"{}\". Valid centers: Heliocentric, Barycentric, Geocentric.",
            src_center, dst_center
        ))),
    }
}

/// Transform a Cartesian position between celestial reference frames.
#[wasm_bindgen(js_name = "transformPositionFrame")]
pub fn transform_position_frame(
    x: f64,
    y: f64,
    z: f64,
    src_frame: &str,
    dst_frame: &str,
    jd: f64,
) -> Result<JsValue, JsError> {
    use siderust::coordinates::cartesian::Position;
    use siderust::coordinates::frames;
    use siderust::coordinates::transform::PositionAstroExt;

    if !x.is_finite() || !y.is_finite() || !z.is_finite() || !jd.is_finite() {
        return Err(JsError::new("x, y, z and jd must be finite"));
    }
    let t = JulianDate::new(jd);

    type C = Heliocentric;

    macro_rules! frame_convert {
        ($src_type:ty, $dst_type:ty, $dst_name:expr) => {{
            let pos = Position::<C, $src_type, AstronomicalUnit>::new(x, y, z);
            let out: Position<C, $dst_type, AstronomicalUnit> =
                PositionAstroExt::to_frame(&pos, &t);
            to_js(&CartesianPosition {
                x: out.x().value(),
                y: out.y().value(),
                z: out.z().value(),
                frame: $dst_name.to_string(),
                center: "Heliocentric".to_string(),
            })
        }};
    }

    match (src_frame, dst_frame) {
        (s, d) if s == d => to_js(&CartesianPosition {
            x,
            y,
            z,
            frame: dst_frame.to_string(),
            center: "Heliocentric".to_string(),
        }),
        ("EclipticMeanJ2000", "EquatorialMeanJ2000") => {
            frame_convert!(frames::EclipticMeanJ2000, frames::EquatorialMeanJ2000, "EquatorialMeanJ2000")
        }
        ("EquatorialMeanJ2000", "EclipticMeanJ2000") => {
            frame_convert!(frames::EquatorialMeanJ2000, frames::EclipticMeanJ2000, "EclipticMeanJ2000")
        }
        ("ICRS", "EclipticMeanJ2000") => {
            frame_convert!(frames::ICRS, frames::EclipticMeanJ2000, "EclipticMeanJ2000")
        }
        ("EclipticMeanJ2000", "ICRS") => {
            frame_convert!(frames::EclipticMeanJ2000, frames::ICRS, "ICRS")
        }
        ("ICRS", "EquatorialMeanJ2000") => {
            frame_convert!(frames::ICRS, frames::EquatorialMeanJ2000, "EquatorialMeanJ2000")
        }
        ("EquatorialMeanJ2000", "ICRS") => {
            frame_convert!(frames::EquatorialMeanJ2000, frames::ICRS, "ICRS")
        }
        ("EquatorialMeanJ2000", "EquatorialMeanOfDate") => {
            frame_convert!(frames::EquatorialMeanJ2000, frames::EquatorialMeanOfDate, "EquatorialMeanOfDate")
        }
        ("EquatorialMeanOfDate", "EquatorialMeanJ2000") => {
            frame_convert!(frames::EquatorialMeanOfDate, frames::EquatorialMeanJ2000, "EquatorialMeanJ2000")
        }
        ("EquatorialMeanOfDate", "EquatorialTrueOfDate") => {
            frame_convert!(frames::EquatorialMeanOfDate, frames::EquatorialTrueOfDate, "EquatorialTrueOfDate")
        }
        ("EquatorialTrueOfDate", "EquatorialMeanOfDate") => {
            frame_convert!(frames::EquatorialTrueOfDate, frames::EquatorialMeanOfDate, "EquatorialMeanOfDate")
        }
        ("ICRS", "EquatorialMeanOfDate") => {
            frame_convert!(frames::ICRS, frames::EquatorialMeanOfDate, "EquatorialMeanOfDate")
        }
        ("EquatorialMeanOfDate", "ICRS") => {
            frame_convert!(frames::EquatorialMeanOfDate, frames::ICRS, "ICRS")
        }
        ("ICRS", "EquatorialTrueOfDate") => {
            frame_convert!(frames::ICRS, frames::EquatorialTrueOfDate, "EquatorialTrueOfDate")
        }
        ("EquatorialTrueOfDate", "ICRS") => {
            frame_convert!(frames::EquatorialTrueOfDate, frames::ICRS, "ICRS")
        }
        ("EquatorialMeanJ2000", "EquatorialTrueOfDate") => {
            frame_convert!(frames::EquatorialMeanJ2000, frames::EquatorialTrueOfDate, "EquatorialTrueOfDate")
        }
        ("EquatorialTrueOfDate", "EquatorialMeanJ2000") => {
            frame_convert!(frames::EquatorialTrueOfDate, frames::EquatorialMeanJ2000, "EquatorialMeanJ2000")
        }
        ("EclipticMeanJ2000", "EquatorialMeanOfDate") => {
            let pos = Position::<C, frames::EclipticMeanJ2000, AstronomicalUnit>::new(x, y, z);
            let via: Position<C, frames::ICRS, AstronomicalUnit> =
                PositionAstroExt::to_frame(&pos, &t);
            let out: Position<C, frames::EquatorialMeanOfDate, AstronomicalUnit> =
                PositionAstroExt::to_frame(&via, &t);
            to_js(&CartesianPosition {
                x: out.x().value(),
                y: out.y().value(),
                z: out.z().value(),
                frame: "EquatorialMeanOfDate".to_string(),
                center: "Heliocentric".to_string(),
            })
        }
        ("EquatorialMeanOfDate", "EclipticMeanJ2000") => {
            let pos = Position::<C, frames::EquatorialMeanOfDate, AstronomicalUnit>::new(x, y, z);
            let via: Position<C, frames::ICRS, AstronomicalUnit> =
                PositionAstroExt::to_frame(&pos, &t);
            let out: Position<C, frames::EclipticMeanJ2000, AstronomicalUnit> =
                PositionAstroExt::to_frame(&via, &t);
            to_js(&CartesianPosition {
                x: out.x().value(),
                y: out.y().value(),
                z: out.z().value(),
                frame: "EclipticMeanJ2000".to_string(),
                center: "Heliocentric".to_string(),
            })
        }
        ("EclipticMeanJ2000", "EquatorialTrueOfDate") => {
            let pos = Position::<C, frames::EclipticMeanJ2000, AstronomicalUnit>::new(x, y, z);
            let via: Position<C, frames::ICRS, AstronomicalUnit> =
                PositionAstroExt::to_frame(&pos, &t);
            let out: Position<C, frames::EquatorialTrueOfDate, AstronomicalUnit> =
                PositionAstroExt::to_frame(&via, &t);
            to_js(&CartesianPosition {
                x: out.x().value(),
                y: out.y().value(),
                z: out.z().value(),
                frame: "EquatorialTrueOfDate".to_string(),
                center: "Heliocentric".to_string(),
            })
        }
        ("EquatorialTrueOfDate", "EclipticMeanJ2000") => {
            let pos = Position::<C, frames::EquatorialTrueOfDate, AstronomicalUnit>::new(x, y, z);
            let via: Position<C, frames::ICRS, AstronomicalUnit> =
                PositionAstroExt::to_frame(&pos, &t);
            let out: Position<C, frames::EclipticMeanJ2000, AstronomicalUnit> =
                PositionAstroExt::to_frame(&via, &t);
            to_js(&CartesianPosition {
                x: out.x().value(),
                y: out.y().value(),
                z: out.z().value(),
                frame: "EclipticMeanJ2000".to_string(),
                center: "Heliocentric".to_string(),
            })
        }
        _ => Err(JsError::new(&format!(
            "Unsupported frame transform: \"{}\" → \"{}\". Valid frames: ICRS, EclipticMeanJ2000, EquatorialMeanJ2000, EquatorialMeanOfDate, EquatorialTrueOfDate.",
            src_frame, dst_frame
        ))),
    }
}

/// Compute the orbital period of a named planet in days (Keplerian).
#[wasm_bindgen(js_name = "orbitalPeriodDays")]
pub fn orbital_period_days(name: &str) -> Result<f64, JsError> {
    use siderust::bodies::planets::OrbitExt;
    use siderust::bodies::solar_system;

    let period_days = match name {
        "Mercury" | "mercury" => solar_system::MERCURY.orbit.period().to::<Day>().value(),
        "Venus" | "venus" => solar_system::VENUS.orbit.period().to::<Day>().value(),
        "Earth" | "earth" => solar_system::EARTH.orbit.period().to::<Day>().value(),
        "Mars" | "mars" => solar_system::MARS.orbit.period().to::<Day>().value(),
        "Jupiter" | "jupiter" => solar_system::JUPITER.orbit.period().to::<Day>().value(),
        "Saturn" | "saturn" => solar_system::SATURN.orbit.period().to::<Day>().value(),
        "Uranus" | "uranus" => solar_system::URANUS.orbit.period().to::<Day>().value(),
        "Neptune" | "neptune" => solar_system::NEPTUNE.orbit.period().to::<Day>().value(),
        _ => {
            return Err(JsError::new(&format!(
                "Unknown planet: \"{name}\". Valid: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune."
            )));
        }
    };
    Ok(period_days)
}
