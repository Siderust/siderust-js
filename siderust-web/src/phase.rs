// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Vallés Puig, Ramon

//! Lunar phase queries — geometry, events, and illumination periods.

use serde::Serialize;
use wasm_bindgen::prelude::*;

use crate::body::to_js;
use crate::events::{make_window, MjdPeriod};
use crate::observer::Observer;

use qtty::*;
use siderust::calculus::ephemeris::Vsop87Ephemeris;
use siderust::calculus::lunar::phase::{
    find_phase_events, illumination_above, illumination_below, illumination_range,
    moon_phase_geocentric, moon_phase_topocentric, MoonPhaseLabel, PhaseSearchOpts,
};
use siderust::time::JulianDate;

// ─────────────────────────────────────────────────────────────────────────────
// Result types
// ─────────────────────────────────────────────────────────────────────────────

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MoonPhase {
    pub phase_angle_deg: f64,
    pub illuminated_fraction: f64,
    pub elongation_deg: f64,
    pub waxing: bool,
    pub label: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PhaseEvent {
    pub mjd: f64,
    pub kind: String,
}

// ─────────────────────────────────────────────────────────────────────────────
// Phase geometry
// ─────────────────────────────────────────────────────────────────────────────

/// Compute geocentric Moon phase geometry at a Julian Date.
#[wasm_bindgen(js_name = "moonPhase")]
pub fn moon_phase(jd: f64) -> Result<JsValue, JsError> {
    if !jd.is_finite() {
        return Err(JsError::new("jd must be finite"));
    }
    let geom = moon_phase_geocentric::<Vsop87Ephemeris>(JulianDate::new(jd));
    let label = geom.label();
    to_js(&MoonPhase {
        phase_angle_deg: geom.phase_angle.to::<Degree>().value(),
        illuminated_fraction: geom.illuminated_fraction,
        elongation_deg: geom.elongation.to::<Degree>().value(),
        waxing: geom.waxing,
        label: label_to_string(label),
    })
}

/// Compute topocentric Moon phase geometry at a Julian Date for an observer.
#[wasm_bindgen(js_name = "moonPhaseTopocentric")]
pub fn moon_phase_topo(jd: f64, observer: &Observer) -> Result<JsValue, JsError> {
    if !jd.is_finite() {
        return Err(JsError::new("jd must be finite"));
    }
    let geom =
        moon_phase_topocentric::<Vsop87Ephemeris>(JulianDate::new(jd), observer.inner.clone());
    let label = geom.label();
    to_js(&MoonPhase {
        phase_angle_deg: geom.phase_angle.to::<Degree>().value(),
        illuminated_fraction: geom.illuminated_fraction,
        elongation_deg: geom.elongation.to::<Degree>().value(),
        waxing: geom.waxing,
        label: label_to_string(label),
    })
}

// ─────────────────────────────────────────────────────────────────────────────
// Phase event finding
// ─────────────────────────────────────────────────────────────────────────────

/// Find all principal lunar phase events in a time window.
#[wasm_bindgen(js_name = "findPhaseEvents")]
pub fn find_phase_events_js(start_mjd: f64, end_mjd: f64) -> Result<JsValue, JsError> {
    let window = make_window(start_mjd, end_mjd)?;
    let events = find_phase_events::<Vsop87Ephemeris>(window, PhaseSearchOpts::default());
    let out: Vec<PhaseEvent> = events
        .into_iter()
        .map(|e| PhaseEvent {
            mjd: e.mjd.value(),
            kind: phase_kind_to_string(e.kind),
        })
        .collect();
    to_js(&out)
}

// ─────────────────────────────────────────────────────────────────────────────
// Illumination periods
// ─────────────────────────────────────────────────────────────────────────────

/// Find periods where geocentric Moon illumination is above `kMin` ∈ [0, 1].
#[wasm_bindgen(js_name = "moonIlluminationAbove")]
pub fn moon_illumination_above(
    start_mjd: f64,
    end_mjd: f64,
    k_min: f64,
) -> Result<JsValue, JsError> {
    let window = make_window(start_mjd, end_mjd)?;
    let periods = illumination_above::<Vsop87Ephemeris>(window, k_min, PhaseSearchOpts::default());
    let out: Vec<MjdPeriod> = periods
        .into_iter()
        .map(|p| MjdPeriod {
            start_mjd: p.start.value(),
            end_mjd: p.end.value(),
        })
        .collect();
    to_js(&out)
}

/// Find periods where geocentric Moon illumination is below `kMax` ∈ [0, 1].
#[wasm_bindgen(js_name = "moonIlluminationBelow")]
pub fn moon_illumination_below(
    start_mjd: f64,
    end_mjd: f64,
    k_max: f64,
) -> Result<JsValue, JsError> {
    let window = make_window(start_mjd, end_mjd)?;
    let periods = illumination_below::<Vsop87Ephemeris>(window, k_max, PhaseSearchOpts::default());
    let out: Vec<MjdPeriod> = periods
        .into_iter()
        .map(|p| MjdPeriod {
            start_mjd: p.start.value(),
            end_mjd: p.end.value(),
        })
        .collect();
    to_js(&out)
}

/// Find periods where geocentric Moon illumination is in `[kMin, kMax]`.
#[wasm_bindgen(js_name = "moonIlluminationRange")]
pub fn moon_illumination_range(
    start_mjd: f64,
    end_mjd: f64,
    k_min: f64,
    k_max: f64,
) -> Result<JsValue, JsError> {
    let window = make_window(start_mjd, end_mjd)?;
    let periods =
        illumination_range::<Vsop87Ephemeris>(window, k_min, k_max, PhaseSearchOpts::default());
    let out: Vec<MjdPeriod> = periods
        .into_iter()
        .map(|p| MjdPeriod {
            start_mjd: p.start.value(),
            end_mjd: p.end.value(),
        })
        .collect();
    to_js(&out)
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

fn label_to_string(label: MoonPhaseLabel) -> String {
    match label {
        MoonPhaseLabel::NewMoon => "NewMoon",
        MoonPhaseLabel::WaxingCrescent => "WaxingCrescent",
        MoonPhaseLabel::FirstQuarter => "FirstQuarter",
        MoonPhaseLabel::WaxingGibbous => "WaxingGibbous",
        MoonPhaseLabel::FullMoon => "FullMoon",
        MoonPhaseLabel::WaningGibbous => "WaningGibbous",
        MoonPhaseLabel::LastQuarter => "LastQuarter",
        MoonPhaseLabel::WaningCrescent => "WaningCrescent",
    }
    .to_string()
}

fn phase_kind_to_string(kind: siderust::calculus::lunar::phase::PhaseKind) -> String {
    use siderust::calculus::lunar::phase::PhaseKind;
    match kind {
        PhaseKind::NewMoon => "NewMoon",
        PhaseKind::FirstQuarter => "FirstQuarter",
        PhaseKind::FullMoon => "FullMoon",
        PhaseKind::LastQuarter => "LastQuarter",
    }
    .to_string()
}
