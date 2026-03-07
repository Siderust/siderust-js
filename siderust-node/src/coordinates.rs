// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Vallés Puig, Ramon

//! Coordinate transform utilities exposed to Node.js.
//!
//! Provides spherical-direction frame transforms and geodetic↔ECEF conversion.

use napi_derive::napi;

use crate::observer::JsObserver;

use qtty::*;
use siderust::coordinates::frames::{
    EclipticMeanJ2000, EquatorialMeanJ2000, EquatorialMeanOfDate, EquatorialTrueOfDate,
    ICRS,
};
use siderust::coordinates::spherical;
use siderust::coordinates::transform::{DirectionAstroExt, SphericalDirectionAstroExt};
use siderust::time::JulianDate;

// ─────────────────────────────────────────────────────────────────────────────
// Result types
// ─────────────────────────────────────────────────────────────────────────────

/// A spherical direction (two angles in degrees) with a frame label.
#[napi(object)]
pub struct SphericalDirection {
    /// First angle in degrees (Dec / polar / altitude).
    pub polar_deg: f64,
    /// Second angle in degrees (RA / azimuth / longitude).
    pub azimuth_deg: f64,
    /// Reference frame name.
    pub frame: String,
}

/// Cartesian ECEF coordinates in metres.
#[napi(object)]
pub struct CartesianEcef {
    /// X coordinate in metres.
    pub x: f64,
    /// Y coordinate in metres.
    pub y: f64,
    /// Z coordinate in metres.
    pub z: f64,
}

// ─────────────────────────────────────────────────────────────────────────────
// Spherical direction transforms
// ─────────────────────────────────────────────────────────────────────────────

/// Transform a spherical direction between celestial reference frames.
///
/// Supported source and destination frames: `"ICRS"`, `"EclipticMeanJ2000"`,
/// `"EquatorialMeanJ2000"`, `"EquatorialMeanOfDate"`, `"EquatorialTrueOfDate"`.
///
/// @param polarDeg   — Declination / polar angle in degrees.
/// @param azimuthDeg — Right ascension / longitude in degrees.
/// @param srcFrame   — Source frame name.
/// @param dstFrame   — Destination frame name.
/// @param jd         — Julian Date (needed for of-date frames; use J2000 = 2451545.0 for epoch-independent frames).
///
/// ```js
/// const { transformDirection } = require('@siderust/siderust');
/// const result = transformDirection(38.78, 279.23, 'EquatorialMeanJ2000', 'EclipticMeanJ2000', 2451545.0);
/// ```
#[napi(js_name = "transformDirection")]
pub fn transform_direction(
    polar_deg: f64,
    azimuth_deg: f64,
    src_frame: String,
    dst_frame: String,
    jd: f64,
) -> napi::Result<SphericalDirection> {
    if !polar_deg.is_finite() || !azimuth_deg.is_finite() || !jd.is_finite() {
        return Err(napi::Error::from_reason(
            "polarDeg, azimuthDeg and jd must be finite",
        ));
    }
    let t = JulianDate::new(jd);

    // Build a source direction in the given frame, then transform.
    // We route through ICRS as the hub frame.
    let icrs_dir = src_to_icrs(polar_deg, azimuth_deg, &src_frame, &t)?;

    // Now convert from ICRS to destination
    icrs_to_dst(&icrs_dir, &dst_frame, &t)
}

/// Transform a spherical direction to the local Horizontal frame.
///
/// @returns `{ polarDeg, azimuthDeg, frame }` where polarDeg is altitude
/// and azimuthDeg is azimuth (N=0° E=90°).
#[napi(js_name = "directionToHorizontal")]
pub fn direction_to_horizontal(
    polar_deg: f64,
    azimuth_deg: f64,
    src_frame: String,
    jd: f64,
    observer: &JsObserver,
) -> napi::Result<SphericalDirection> {
    if !polar_deg.is_finite() || !azimuth_deg.is_finite() || !jd.is_finite() {
        return Err(napi::Error::from_reason(
            "polarDeg, azimuthDeg and jd must be finite",
        ));
    }
    let t = JulianDate::new(jd);
    let icrs_dir = src_to_icrs(polar_deg, azimuth_deg, &src_frame, &t)?;

    // ICRS → EquatorialTrueOfDate → Horizontal
    let eq_tod =
        SphericalDirectionAstroExt::to_frame::<EquatorialTrueOfDate>(&icrs_dir, &t);
    let cart = eq_tod.to_cartesian();
    let hz = DirectionAstroExt::to_horizontal(&cart, &t, &observer.inner);
    let hz_sph = spherical::Direction::from_cartesian(&hz);

    Ok(SphericalDirection {
        polar_deg: hz_sph.polar.value(),
        azimuth_deg: hz_sph.azimuth.value(),
        frame: "Horizontal".to_string(),
    })
}

/// Convert a geodetic position (WGS84) to ECEF Cartesian coordinates.
///
/// @param observer — Observer with lon/lat/height.
/// @returns `{ x, y, z }` in metres.
#[napi(js_name = "geodeticToEcef")]
pub fn geodetic_to_ecef(observer: &JsObserver) -> CartesianEcef {
    let cart = observer.inner.to_cartesian::<Meter>();
    CartesianEcef {
        x: cart.x().value(),
        y: cart.y().value(),
        z: cart.z().value(),
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────────────

/// Convert from any supported source frame to ICRS.
fn src_to_icrs(
    polar_deg: f64,
    azimuth_deg: f64,
    src_frame: &str,
    jd: &JulianDate,
) -> napi::Result<spherical::Direction<ICRS>> {
    match src_frame {
        "ICRS" => {
            let d = spherical::Direction::<ICRS>::new(Degrees::new(azimuth_deg), Degrees::new(polar_deg));
            Ok(d)
        }
        "EclipticMeanJ2000" => {
            let d = spherical::Direction::<EclipticMeanJ2000>::new(
                Degrees::new(azimuth_deg),
                Degrees::new(polar_deg),
            );
            Ok(SphericalDirectionAstroExt::to_frame::<ICRS>(&d, jd))
        }
        "EquatorialMeanJ2000" => {
            let d = spherical::Direction::<EquatorialMeanJ2000>::new(
                Degrees::new(azimuth_deg),
                Degrees::new(polar_deg),
            );
            Ok(SphericalDirectionAstroExt::to_frame::<ICRS>(&d, jd))
        }
        "EquatorialMeanOfDate" => {
            let d = spherical::Direction::<EquatorialMeanOfDate>::new(
                Degrees::new(azimuth_deg),
                Degrees::new(polar_deg),
            );
            Ok(SphericalDirectionAstroExt::to_frame::<ICRS>(&d, jd))
        }
        "EquatorialTrueOfDate" => {
            let d = spherical::Direction::<EquatorialTrueOfDate>::new(
                Degrees::new(azimuth_deg),
                Degrees::new(polar_deg),
            );
            Ok(SphericalDirectionAstroExt::to_frame::<ICRS>(&d, jd))
        }
        _ => Err(napi::Error::from_reason(format!(
            "Unsupported source frame: \"{src_frame}\". Valid: ICRS, EclipticMeanJ2000, EquatorialMeanJ2000, EquatorialMeanOfDate, EquatorialTrueOfDate."
        ))),
    }
}

/// Convert from ICRS to any supported destination frame.
fn icrs_to_dst(
    icrs: &spherical::Direction<ICRS>,
    dst_frame: &str,
    jd: &JulianDate,
) -> napi::Result<SphericalDirection> {
    match dst_frame {
        "ICRS" => Ok(SphericalDirection {
            polar_deg: icrs.polar.value(),
            azimuth_deg: icrs.azimuth.value(),
            frame: "ICRS".to_string(),
        }),
        "EclipticMeanJ2000" => {
            let d = SphericalDirectionAstroExt::to_frame::<EclipticMeanJ2000>(icrs, jd);
            Ok(SphericalDirection {
                polar_deg: d.polar.value(),
                azimuth_deg: d.azimuth.value(),
                frame: "EclipticMeanJ2000".to_string(),
            })
        }
        "EquatorialMeanJ2000" => {
            let d = SphericalDirectionAstroExt::to_frame::<EquatorialMeanJ2000>(icrs, jd);
            Ok(SphericalDirection {
                polar_deg: d.polar.value(),
                azimuth_deg: d.azimuth.value(),
                frame: "EquatorialMeanJ2000".to_string(),
            })
        }
        "EquatorialMeanOfDate" => {
            let d = SphericalDirectionAstroExt::to_frame::<EquatorialMeanOfDate>(icrs, jd);
            Ok(SphericalDirection {
                polar_deg: d.polar.value(),
                azimuth_deg: d.azimuth.value(),
                frame: "EquatorialMeanOfDate".to_string(),
            })
        }
        "EquatorialTrueOfDate" => {
            let d = SphericalDirectionAstroExt::to_frame::<EquatorialTrueOfDate>(icrs, jd);
            Ok(SphericalDirection {
                polar_deg: d.polar.value(),
                azimuth_deg: d.azimuth.value(),
                frame: "EquatorialTrueOfDate".to_string(),
            })
        }
        _ => Err(napi::Error::from_reason(format!(
            "Unsupported destination frame: \"{dst_frame}\". Valid: ICRS, EclipticMeanJ2000, EquatorialMeanJ2000, EquatorialMeanOfDate, EquatorialTrueOfDate."
        ))),
    }
}
