// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Vallés Puig, Ramon

//! Observer validation and preset logic shared between Node and Web bindings.

use qtty::*;
use siderust::coordinates::centers::Geodetic;
use siderust::coordinates::frames::ECEF;
use siderust::observatories;

/// Validate observer coordinates.
/// Returns `Err(error_message)` if any coordinate is non-finite.
pub fn validate_observer_coords(lon_deg: f64, lat_deg: f64, height_m: f64) -> Result<(), String> {
    if !lon_deg.is_finite() || !lat_deg.is_finite() || !height_m.is_finite() {
        return Err("Observer coordinates must be finite (not NaN or ±infinity)".to_string());
    }
    Ok(())
}

/// Create a Geodetic observer from coordinates.
pub fn create_observer(lon_deg: f64, lat_deg: f64, height_m: f64) -> Geodetic<ECEF> {
    Geodetic::<ECEF>::new(
        Degrees::new(lon_deg),
        Degrees::new(lat_deg),
        Meters::new(height_m),
    )
}

/// Get Roque de los Muchachos observatory.
pub fn roque_de_los_muchachos() -> Geodetic<ECEF> {
    observatories::ROQUE_DE_LOS_MUCHACHOS
}

/// Get Paranal observatory.
pub fn el_paranal() -> Geodetic<ECEF> {
    observatories::EL_PARANAL
}

/// Get Mauna Kea observatory.
pub fn mauna_kea() -> Geodetic<ECEF> {
    observatories::MAUNA_KEA
}

/// Get observer property values.
pub fn get_observer_lon_deg(obs: &Geodetic<ECEF>) -> f64 {
    obs.lon.to::<Degree>().value()
}

pub fn get_observer_lat_deg(obs: &Geodetic<ECEF>) -> f64 {
    obs.lat.to::<Degree>().value()
}

pub fn get_observer_height_m(obs: &Geodetic<ECEF>) -> f64 {
    obs.height.to::<Meter>().value()
}
