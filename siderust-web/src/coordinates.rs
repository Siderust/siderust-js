// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Vallés Puig, Ramon

//! Coordinate transform utilities exposed to the browser.

use serde::Serialize;
use wasm_bindgen::prelude::*;

use crate::body::to_js;
use crate::observer::Observer;

use qtty::*;
use siderust::coordinates::frames::{
    EclipticMeanJ2000, EquatorialMeanJ2000, EquatorialMeanOfDate, EquatorialTrueOfDate, ICRS,
};
use siderust::coordinates::spherical;
use siderust::coordinates::transform::{DirectionAstroExt, SphericalDirectionAstroExt};
use siderust::time::JulianDate;

// ─────────────────────────────────────────────────────────────────────────────
// Result types
// ─────────────────────────────────────────────────────────────────────────────

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SphericalDirection {
    pub polar_deg: f64,
    pub azimuth_deg: f64,
    pub frame: String,
}

#[derive(Serialize)]
pub struct CartesianEcef {
    pub x: f64,
    pub y: f64,
    pub z: f64,
}

// ─────────────────────────────────────────────────────────────────────────────
// Spherical direction transforms
// ─────────────────────────────────────────────────────────────────────────────

/// Transform a spherical direction between celestial reference frames.
#[wasm_bindgen(js_name = "transformDirection")]
pub fn transform_direction(
    polar_deg: f64,
    azimuth_deg: f64,
    src_frame: &str,
    dst_frame: &str,
    jd: f64,
) -> Result<JsValue, JsError> {
    if !polar_deg.is_finite() || !azimuth_deg.is_finite() || !jd.is_finite() {
        return Err(JsError::new(
            "polarDeg, azimuthDeg and jd must be finite",
        ));
    }
    let t = JulianDate::new(jd);
    let icrs_dir = src_to_icrs(polar_deg, azimuth_deg, src_frame, &t)?;
    icrs_to_dst(&icrs_dir, dst_frame, &t)
}

/// Transform a spherical direction to the local Horizontal frame.
#[wasm_bindgen(js_name = "directionToHorizontal")]
pub fn direction_to_horizontal(
    polar_deg: f64,
    azimuth_deg: f64,
    src_frame: &str,
    jd: f64,
    observer: &Observer,
) -> Result<JsValue, JsError> {
    if !polar_deg.is_finite() || !azimuth_deg.is_finite() || !jd.is_finite() {
        return Err(JsError::new(
            "polarDeg, azimuthDeg and jd must be finite",
        ));
    }
    let t = JulianDate::new(jd);
    let icrs_dir = src_to_icrs(polar_deg, azimuth_deg, src_frame, &t)?;

    let eq_tod =
        SphericalDirectionAstroExt::to_frame::<EquatorialTrueOfDate>(&icrs_dir, &t);
    let cart = eq_tod.to_cartesian();
    let hz = DirectionAstroExt::to_horizontal(&cart, &t, &observer.inner);
    let hz_sph = spherical::Direction::from_cartesian(&hz);

    to_js(&SphericalDirection {
        polar_deg: hz_sph.polar.value(),
        azimuth_deg: hz_sph.azimuth.value(),
        frame: "Horizontal".to_string(),
    })
}

/// Convert a geodetic position (WGS84) to ECEF Cartesian coordinates.
#[wasm_bindgen(js_name = "geodeticToEcef")]
pub fn geodetic_to_ecef(observer: &Observer) -> Result<JsValue, JsError> {
    let cart = observer.inner.to_cartesian::<Meter>();
    to_js(&CartesianEcef {
        x: cart.x().value(),
        y: cart.y().value(),
        z: cart.z().value(),
    })
}

// ─────────────────────────────────────────────────────────────────────────────
// Angular separation
// ─────────────────────────────────────────────────────────────────────────────

/// Compute angular separation between two spherical directions (Vincenty formula).
#[wasm_bindgen(js_name = "angularSeparation")]
pub fn angular_separation(
    polar1_deg: f64,
    azimuth1_deg: f64,
    polar2_deg: f64,
    azimuth2_deg: f64,
    frame: &str,
) -> Result<f64, JsError> {
    if !polar1_deg.is_finite()
        || !azimuth1_deg.is_finite()
        || !polar2_deg.is_finite()
        || !azimuth2_deg.is_finite()
    {
        return Err(JsError::new("All angle parameters must be finite"));
    }

    let sep = match frame {
        "ICRS" => {
            let d1 = spherical::Direction::<ICRS>::new(
                Degrees::new(azimuth1_deg),
                Degrees::new(polar1_deg),
            );
            let d2 = spherical::Direction::<ICRS>::new(
                Degrees::new(azimuth2_deg),
                Degrees::new(polar2_deg),
            );
            d1.angular_separation(&d2)
        }
        "EclipticMeanJ2000" => {
            let d1 = spherical::Direction::<EclipticMeanJ2000>::new(
                Degrees::new(azimuth1_deg),
                Degrees::new(polar1_deg),
            );
            let d2 = spherical::Direction::<EclipticMeanJ2000>::new(
                Degrees::new(azimuth2_deg),
                Degrees::new(polar2_deg),
            );
            d1.angular_separation(&d2)
        }
        "EquatorialMeanJ2000" => {
            let d1 = spherical::Direction::<EquatorialMeanJ2000>::new(
                Degrees::new(azimuth1_deg),
                Degrees::new(polar1_deg),
            );
            let d2 = spherical::Direction::<EquatorialMeanJ2000>::new(
                Degrees::new(azimuth2_deg),
                Degrees::new(polar2_deg),
            );
            d1.angular_separation(&d2)
        }
        _ => {
            return Err(JsError::new(&format!(
                "Unsupported frame for angular separation: \"{frame}\". Valid: ICRS, EclipticMeanJ2000, EquatorialMeanJ2000."
            )));
        }
    };
    Ok(sep.value())
}

/// Compute the Euclidean distance between two 3D Cartesian positions.
#[wasm_bindgen(js_name = "cartesianDistance")]
pub fn cartesian_distance(
    x1: f64, y1: f64, z1: f64,
    x2: f64, y2: f64, z2: f64,
) -> f64 {
    let dx = x2 - x1;
    let dy = y2 - y1;
    let dz = z2 - z1;
    (dx * dx + dy * dy + dz * dz).sqrt()
}

/// Compute the magnitude of a 3D Cartesian vector.
#[wasm_bindgen(js_name = "cartesianMagnitude")]
pub fn cartesian_magnitude(x: f64, y: f64, z: f64) -> f64 {
    (x * x + y * y + z * z).sqrt()
}

/// Compute the dot product of two 3D Cartesian vectors.
#[wasm_bindgen(js_name = "dotProduct")]
pub fn dot_product(x1: f64, y1: f64, z1: f64, x2: f64, y2: f64, z2: f64) -> f64 {
    x1 * x2 + y1 * y2 + z1 * z2
}

/// Convert a direction from spherical to Cartesian.
#[wasm_bindgen(js_name = "directionToCartesian")]
pub fn direction_to_cartesian(polar_deg: f64, azimuth_deg: f64) -> Result<JsValue, JsError> {
    let d = spherical::Direction::<ICRS>::new(
        Degrees::new(azimuth_deg),
        Degrees::new(polar_deg),
    );
    let c = d.to_cartesian();
    to_js(&CartesianEcef {
        x: c.x(),
        y: c.y(),
        z: c.z(),
    })
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────────────

fn src_to_icrs(
    polar_deg: f64,
    azimuth_deg: f64,
    src_frame: &str,
    jd: &JulianDate,
) -> Result<spherical::Direction<ICRS>, JsError> {
    match src_frame {
        "ICRS" => Ok(spherical::Direction::<ICRS>::new(
            Degrees::new(azimuth_deg),
            Degrees::new(polar_deg),
        )),
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
        _ => Err(JsError::new(&format!(
            "Unsupported source frame: \"{src_frame}\". Valid: ICRS, EclipticMeanJ2000, EquatorialMeanJ2000, EquatorialMeanOfDate, EquatorialTrueOfDate."
        ))),
    }
}

fn icrs_to_dst(
    icrs: &spherical::Direction<ICRS>,
    dst_frame: &str,
    jd: &JulianDate,
) -> Result<JsValue, JsError> {
    match dst_frame {
        "ICRS" => to_js(&SphericalDirection {
            polar_deg: icrs.polar.value(),
            azimuth_deg: icrs.azimuth.value(),
            frame: "ICRS".to_string(),
        }),
        "EclipticMeanJ2000" => {
            let d = SphericalDirectionAstroExt::to_frame::<EclipticMeanJ2000>(icrs, jd);
            to_js(&SphericalDirection {
                polar_deg: d.polar.value(),
                azimuth_deg: d.azimuth.value(),
                frame: "EclipticMeanJ2000".to_string(),
            })
        }
        "EquatorialMeanJ2000" => {
            let d = SphericalDirectionAstroExt::to_frame::<EquatorialMeanJ2000>(icrs, jd);
            to_js(&SphericalDirection {
                polar_deg: d.polar.value(),
                azimuth_deg: d.azimuth.value(),
                frame: "EquatorialMeanJ2000".to_string(),
            })
        }
        "EquatorialMeanOfDate" => {
            let d = SphericalDirectionAstroExt::to_frame::<EquatorialMeanOfDate>(icrs, jd);
            to_js(&SphericalDirection {
                polar_deg: d.polar.value(),
                azimuth_deg: d.azimuth.value(),
                frame: "EquatorialMeanOfDate".to_string(),
            })
        }
        "EquatorialTrueOfDate" => {
            let d = SphericalDirectionAstroExt::to_frame::<EquatorialTrueOfDate>(icrs, jd);
            to_js(&SphericalDirection {
                polar_deg: d.polar.value(),
                azimuth_deg: d.azimuth.value(),
                frame: "EquatorialTrueOfDate".to_string(),
            })
        }
        _ => Err(JsError::new(&format!(
            "Unsupported destination frame: \"{dst_frame}\". Valid: ICRS, EclipticMeanJ2000, EquatorialMeanJ2000, EquatorialMeanOfDate, EquatorialTrueOfDate."
        ))),
    }
}
