// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Vallés Puig, Ramon

//! VSOP87 ephemeris — solar-system body positions at a given epoch.

use napi_derive::napi;

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
        "Earth" | "earth" => helio!(Earth),
        "Mars" | "mars" => helio!(Mars),
        "Jupiter" | "jupiter" => helio!(Jupiter),
        "Saturn" | "saturn" => helio!(Saturn),
        "Uranus" | "uranus" => helio!(Uranus),
        "Neptune" | "neptune" => helio!(Neptune),
        _ => Err(napi::Error::from_reason(format!(
            "Unknown planet for VSOP87 heliocentric: \"{body}\". Valid: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune.",
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
        "Earth" | "earth" => bary!(Earth),
        "Mars" | "mars" => bary!(Mars),
        "Jupiter" | "jupiter" => bary!(Jupiter),
        "Saturn" | "saturn" => bary!(Saturn),
        "Uranus" | "uranus" => bary!(Uranus),
        "Neptune" | "neptune" => bary!(Neptune),
        _ => Err(napi::Error::from_reason(format!(
            "Unknown planet for VSOP87 barycentric: \"{body}\". Valid: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune.",
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

// ─────────────────────────────────────────────────────────────────────────────
// Center transforms
// ─────────────────────────────────────────────────────────────────────────────

/// Transform a Cartesian position from one reference center to another.
///
/// Stays in the EclipticMeanJ2000 frame (the natural VSOP87 frame).
/// Units are AU (except Geocentric Moon which is km).
///
/// Supported center pairs: Heliocentric ↔ Geocentric, Heliocentric ↔ Barycentric,
/// Geocentric ↔ Barycentric.
///
/// @param x, y, z       — Cartesian coordinates.
/// @param srcCenter      — Source center: `"Heliocentric"`, `"Barycentric"`, `"Geocentric"`.
/// @param dstCenter      — Destination center.
/// @param jd             — Julian Date.
///
/// ```js
/// const mars = vsop87Heliocentric('Mars', 2451545.0);
/// const marsGeo = transformPositionCenter(mars.x, mars.y, mars.z, 'Heliocentric', 'Geocentric', 2451545.0);
/// ```
#[napi(js_name = "transformPositionCenter")]
pub fn transform_position_center(
    x: f64,
    y: f64,
    z: f64,
    src_center: String,
    dst_center: String,
    jd: f64,
) -> napi::Result<CartesianPosition> {
    if !x.is_finite() || !y.is_finite() || !z.is_finite() || !jd.is_finite() {
        return Err(napi::Error::from_reason(
            "x, y, z and jd must be finite",
        ));
    }
    let t = JulianDate::new(jd);

    match (src_center.as_str(), dst_center.as_str()) {
        // Identity
        (s, d) if s == d => Ok(CartesianPosition {
            x, y, z,
            frame: "EclipticMeanJ2000".to_string(),
            center: dst_center,
        }),
        // Heliocentric → Geocentric
        ("Heliocentric", "Geocentric") => {
            let pos = EclipticMeanJ2000::<AstronomicalUnit, Heliocentric>::new(x, y, z);
            let out: EclipticMeanJ2000<AstronomicalUnit, Geocentric> = pos.to_center(t);
            Ok(CartesianPosition {
                x: out.x().value(), y: out.y().value(), z: out.z().value(),
                frame: "EclipticMeanJ2000".to_string(),
                center: "Geocentric".to_string(),
            })
        }
        // Geocentric → Heliocentric
        ("Geocentric", "Heliocentric") => {
            let pos = EclipticMeanJ2000::<AstronomicalUnit, Geocentric>::new(x, y, z);
            let out: EclipticMeanJ2000<AstronomicalUnit, Heliocentric> = pos.to_center(t);
            Ok(CartesianPosition {
                x: out.x().value(), y: out.y().value(), z: out.z().value(),
                frame: "EclipticMeanJ2000".to_string(),
                center: "Heliocentric".to_string(),
            })
        }
        // Heliocentric → Barycentric
        ("Heliocentric", "Barycentric") => {
            let pos = EclipticMeanJ2000::<AstronomicalUnit, Heliocentric>::new(x, y, z);
            let out: EclipticMeanJ2000<AstronomicalUnit, Barycentric> = pos.to_center(t);
            Ok(CartesianPosition {
                x: out.x().value(), y: out.y().value(), z: out.z().value(),
                frame: "EclipticMeanJ2000".to_string(),
                center: "Barycentric".to_string(),
            })
        }
        // Barycentric → Heliocentric
        ("Barycentric", "Heliocentric") => {
            let pos = EclipticMeanJ2000::<AstronomicalUnit, Barycentric>::new(x, y, z);
            let out: EclipticMeanJ2000<AstronomicalUnit, Heliocentric> = pos.to_center(t);
            Ok(CartesianPosition {
                x: out.x().value(), y: out.y().value(), z: out.z().value(),
                frame: "EclipticMeanJ2000".to_string(),
                center: "Heliocentric".to_string(),
            })
        }
        // Barycentric → Geocentric
        ("Barycentric", "Geocentric") => {
            let pos = EclipticMeanJ2000::<AstronomicalUnit, Barycentric>::new(x, y, z);
            let out: EclipticMeanJ2000<AstronomicalUnit, Geocentric> = pos.to_center(t);
            Ok(CartesianPosition {
                x: out.x().value(), y: out.y().value(), z: out.z().value(),
                frame: "EclipticMeanJ2000".to_string(),
                center: "Geocentric".to_string(),
            })
        }
        // Geocentric → Barycentric
        ("Geocentric", "Barycentric") => {
            let pos = EclipticMeanJ2000::<AstronomicalUnit, Geocentric>::new(x, y, z);
            let out: EclipticMeanJ2000<AstronomicalUnit, Barycentric> = pos.to_center(t);
            Ok(CartesianPosition {
                x: out.x().value(), y: out.y().value(), z: out.z().value(),
                frame: "EclipticMeanJ2000".to_string(),
                center: "Barycentric".to_string(),
            })
        }
        _ => Err(napi::Error::from_reason(format!(
            "Unsupported center transform: \"{}\" → \"{}\". Valid centers: Heliocentric, Barycentric, Geocentric.",
            src_center, dst_center
        ))),
    }
}

/// Transform a Cartesian position between celestial reference frames.
///
/// Stays in the same center. Coordinates are in AU.
///
/// Supported frames: `"ICRS"`, `"EclipticMeanJ2000"`, `"EquatorialMeanJ2000"`.
///
/// @param x, y, z    — Cartesian coordinates in AU.
/// @param srcFrame    — Source frame name.
/// @param dstFrame    — Destination frame name.
/// @param jd          — Julian Date.
#[napi(js_name = "transformPositionFrame")]
pub fn transform_position_frame(
    x: f64,
    y: f64,
    z: f64,
    src_frame: String,
    dst_frame: String,
    jd: f64,
) -> napi::Result<CartesianPosition> {
    use siderust::coordinates::cartesian::Position;
    use siderust::coordinates::frames;
    use siderust::coordinates::transform::PositionAstroExt;

    if !x.is_finite() || !y.is_finite() || !z.is_finite() || !jd.is_finite() {
        return Err(napi::Error::from_reason(
            "x, y, z and jd must be finite",
        ));
    }
    let t = JulianDate::new(jd);

    // We use Heliocentric as the Center parameter (arbitrary, since frame rotations don't depend on center)
    type C = Heliocentric;

    macro_rules! frame_convert {
        ($src_type:ty, $dst_type:ty, $dst_name:expr) => {{
            let pos = Position::<C, $src_type, AstronomicalUnit>::new(x, y, z);
            let out: Position<C, $dst_type, AstronomicalUnit> = PositionAstroExt::to_frame(&pos, &t);
            Ok(CartesianPosition {
                x: out.x().value(), y: out.y().value(), z: out.z().value(),
                frame: $dst_name.to_string(),
                center: "Heliocentric".to_string(),
            })
        }};
    }

    match (src_frame.as_str(), dst_frame.as_str()) {
        (s, d) if s == d => Ok(CartesianPosition {
            x, y, z,
            frame: dst_frame,
            center: "Heliocentric".to_string(),
        }),
        ("EclipticMeanJ2000", "EquatorialMeanJ2000") => frame_convert!(frames::EclipticMeanJ2000, frames::EquatorialMeanJ2000, "EquatorialMeanJ2000"),
        ("EquatorialMeanJ2000", "EclipticMeanJ2000") => frame_convert!(frames::EquatorialMeanJ2000, frames::EclipticMeanJ2000, "EclipticMeanJ2000"),
        ("ICRS", "EclipticMeanJ2000") => frame_convert!(frames::ICRS, frames::EclipticMeanJ2000, "EclipticMeanJ2000"),
        ("EclipticMeanJ2000", "ICRS") => frame_convert!(frames::EclipticMeanJ2000, frames::ICRS, "ICRS"),
        ("ICRS", "EquatorialMeanJ2000") => frame_convert!(frames::ICRS, frames::EquatorialMeanJ2000, "EquatorialMeanJ2000"),
        ("EquatorialMeanJ2000", "ICRS") => frame_convert!(frames::EquatorialMeanJ2000, frames::ICRS, "ICRS"),
        ("EquatorialMeanJ2000", "EquatorialMeanOfDate") => frame_convert!(frames::EquatorialMeanJ2000, frames::EquatorialMeanOfDate, "EquatorialMeanOfDate"),
        ("EquatorialMeanOfDate", "EquatorialMeanJ2000") => frame_convert!(frames::EquatorialMeanOfDate, frames::EquatorialMeanJ2000, "EquatorialMeanJ2000"),
        ("EquatorialMeanOfDate", "EquatorialTrueOfDate") => frame_convert!(frames::EquatorialMeanOfDate, frames::EquatorialTrueOfDate, "EquatorialTrueOfDate"),
        ("EquatorialTrueOfDate", "EquatorialMeanOfDate") => frame_convert!(frames::EquatorialTrueOfDate, frames::EquatorialMeanOfDate, "EquatorialMeanOfDate"),
        ("ICRS", "EquatorialMeanOfDate") => frame_convert!(frames::ICRS, frames::EquatorialMeanOfDate, "EquatorialMeanOfDate"),
        ("EquatorialMeanOfDate", "ICRS") => frame_convert!(frames::EquatorialMeanOfDate, frames::ICRS, "ICRS"),
        ("ICRS", "EquatorialTrueOfDate") => frame_convert!(frames::ICRS, frames::EquatorialTrueOfDate, "EquatorialTrueOfDate"),
        ("EquatorialTrueOfDate", "ICRS") => frame_convert!(frames::EquatorialTrueOfDate, frames::ICRS, "ICRS"),
        ("EquatorialMeanJ2000", "EquatorialTrueOfDate") => frame_convert!(frames::EquatorialMeanJ2000, frames::EquatorialTrueOfDate, "EquatorialTrueOfDate"),
        ("EquatorialTrueOfDate", "EquatorialMeanJ2000") => frame_convert!(frames::EquatorialTrueOfDate, frames::EquatorialMeanJ2000, "EquatorialMeanJ2000"),
        ("EclipticMeanJ2000", "EquatorialMeanOfDate") => {
            // Route through ICRS: EclipticMeanJ2000 → ICRS → EquatorialMeanOfDate
            let pos = Position::<C, frames::EclipticMeanJ2000, AstronomicalUnit>::new(x, y, z);
            let via: Position<C, frames::ICRS, AstronomicalUnit> = PositionAstroExt::to_frame(&pos, &t);
            let out: Position<C, frames::EquatorialMeanOfDate, AstronomicalUnit> = PositionAstroExt::to_frame(&via, &t);
            Ok(CartesianPosition {
                x: out.x().value(), y: out.y().value(), z: out.z().value(),
                frame: "EquatorialMeanOfDate".to_string(),
                center: "Heliocentric".to_string(),
            })
        }
        ("EquatorialMeanOfDate", "EclipticMeanJ2000") => {
            let pos = Position::<C, frames::EquatorialMeanOfDate, AstronomicalUnit>::new(x, y, z);
            let via: Position<C, frames::ICRS, AstronomicalUnit> = PositionAstroExt::to_frame(&pos, &t);
            let out: Position<C, frames::EclipticMeanJ2000, AstronomicalUnit> = PositionAstroExt::to_frame(&via, &t);
            Ok(CartesianPosition {
                x: out.x().value(), y: out.y().value(), z: out.z().value(),
                frame: "EclipticMeanJ2000".to_string(),
                center: "Heliocentric".to_string(),
            })
        }
        ("EclipticMeanJ2000", "EquatorialTrueOfDate") => {
            let pos = Position::<C, frames::EclipticMeanJ2000, AstronomicalUnit>::new(x, y, z);
            let via: Position<C, frames::ICRS, AstronomicalUnit> = PositionAstroExt::to_frame(&pos, &t);
            let out: Position<C, frames::EquatorialTrueOfDate, AstronomicalUnit> = PositionAstroExt::to_frame(&via, &t);
            Ok(CartesianPosition {
                x: out.x().value(), y: out.y().value(), z: out.z().value(),
                frame: "EquatorialTrueOfDate".to_string(),
                center: "Heliocentric".to_string(),
            })
        }
        ("EquatorialTrueOfDate", "EclipticMeanJ2000") => {
            let pos = Position::<C, frames::EquatorialTrueOfDate, AstronomicalUnit>::new(x, y, z);
            let via: Position<C, frames::ICRS, AstronomicalUnit> = PositionAstroExt::to_frame(&pos, &t);
            let out: Position<C, frames::EclipticMeanJ2000, AstronomicalUnit> = PositionAstroExt::to_frame(&via, &t);
            Ok(CartesianPosition {
                x: out.x().value(), y: out.y().value(), z: out.z().value(),
                frame: "EclipticMeanJ2000".to_string(),
                center: "Heliocentric".to_string(),
            })
        }
        _ => Err(napi::Error::from_reason(format!(
            "Unsupported frame transform: \"{}\" → \"{}\". Valid frames: ICRS, EclipticMeanJ2000, EquatorialMeanJ2000, EquatorialMeanOfDate, EquatorialTrueOfDate.",
            src_frame, dst_frame
        ))),
    }
}

/// Compute the orbital period of a named planet in days (Keplerian).
///
/// @param name — Planet name.
/// @returns Orbital period in days.
#[napi(js_name = "orbitalPeriodDays")]
pub fn orbital_period_days(name: String) -> napi::Result<f64> {
    use siderust::bodies::planets::OrbitExt;
    use siderust::bodies::solar_system;

    let period_days = match name.as_str() {
        "Mercury" | "mercury" => solar_system::MERCURY.orbit.period().to::<Day>().value(),
        "Venus" | "venus" => solar_system::VENUS.orbit.period().to::<Day>().value(),
        "Earth" | "earth" => solar_system::EARTH.orbit.period().to::<Day>().value(),
        "Mars" | "mars" => solar_system::MARS.orbit.period().to::<Day>().value(),
        "Jupiter" | "jupiter" => solar_system::JUPITER.orbit.period().to::<Day>().value(),
        "Saturn" | "saturn" => solar_system::SATURN.orbit.period().to::<Day>().value(),
        "Uranus" | "uranus" => solar_system::URANUS.orbit.period().to::<Day>().value(),
        "Neptune" | "neptune" => solar_system::NEPTUNE.orbit.period().to::<Day>().value(),
        _ => {
            return Err(napi::Error::from_reason(format!(
                "Unknown planet: \"{name}\". Valid: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune."
            )));
        }
    };
    Ok(period_days)
}
