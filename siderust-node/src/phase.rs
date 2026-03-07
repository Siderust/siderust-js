// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Vallés Puig, Ramon

//! Lunar phase queries — geometry, events, and illumination periods.

use napi_derive::napi;

use crate::events::{make_window, MjdPeriod};
use crate::observer::JsObserver;

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

/// Moon phase geometry at a single instant.
#[napi(object)]
pub struct MoonPhase {
    /// Phase angle in degrees (Sun-Moon-Earth/observer angle).
    pub phase_angle_deg: f64,
    /// Fraction of the disk illuminated [0, 1].
    pub illuminated_fraction: f64,
    /// Elongation in degrees (eastward from the Sun).
    pub elongation_deg: f64,
    /// Whether the Moon is waxing.
    pub waxing: bool,
    /// Named phase label (e.g. `"FullMoon"`, `"WaxingCrescent"`).
    pub label: String,
}

/// A principal lunar phase event (New Moon, First Quarter, Full Moon, Last Quarter).
#[napi(object)]
pub struct PhaseEvent {
    /// Time of the event (Modified Julian Date).
    pub mjd: f64,
    /// Phase kind: `"NewMoon"`, `"FirstQuarter"`, `"FullMoon"`, `"LastQuarter"`.
    pub kind: String,
}

// ─────────────────────────────────────────────────────────────────────────────
// Phase geometry
// ─────────────────────────────────────────────────────────────────────────────

/// Compute geocentric Moon phase geometry at a Julian Date.
///
/// @param jd — Julian Date.
/// @returns Phase geometry including illumination, elongation, and named label.
///
/// ```js
/// const { moonPhase } = require('@siderust/siderust');
/// const phase = moonPhase(2451545.0);
/// console.log(phase.label, phase.illuminatedFraction);
/// ```
#[napi(js_name = "moonPhase")]
pub fn moon_phase(jd: f64) -> napi::Result<MoonPhase> {
    if !jd.is_finite() {
        return Err(napi::Error::from_reason("jd must be finite"));
    }
    let geom = moon_phase_geocentric::<Vsop87Ephemeris>(JulianDate::new(jd));
    let label = geom.label();
    Ok(MoonPhase {
        phase_angle_deg: geom.phase_angle.to::<Degree>().value(),
        illuminated_fraction: geom.illuminated_fraction,
        elongation_deg: geom.elongation.to::<Degree>().value(),
        waxing: geom.waxing,
        label: label_to_string(label),
    })
}

/// Compute topocentric Moon phase geometry at a Julian Date for an observer.
///
/// @param jd       — Julian Date.
/// @param observer — Observer location on Earth.
#[napi(js_name = "moonPhaseTopocentric")]
pub fn moon_phase_topo(jd: f64, observer: &JsObserver) -> napi::Result<MoonPhase> {
    if !jd.is_finite() {
        return Err(napi::Error::from_reason("jd must be finite"));
    }
    let geom =
        moon_phase_topocentric::<Vsop87Ephemeris>(JulianDate::new(jd), observer.inner.clone());
    let label = geom.label();
    Ok(MoonPhase {
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
///
/// @param startMjd — Window start (MJD).
/// @param endMjd   — Window end (MJD).
/// @returns Sorted array of `{ mjd, kind }` events.
///
/// ```js
/// const { findPhaseEvents } = require('@siderust/siderust');
/// const events = findPhaseEvents(60000.0, 60030.0);  // ~1 month
/// events.forEach(e => console.log(e.kind, e.mjd));
/// ```
#[napi(js_name = "findPhaseEvents")]
pub fn find_phase_events_js(start_mjd: f64, end_mjd: f64) -> napi::Result<Vec<PhaseEvent>> {
    let window = make_window(start_mjd, end_mjd)?;
    let events = find_phase_events::<Vsop87Ephemeris>(window, PhaseSearchOpts::default());
    Ok(events
        .into_iter()
        .map(|e| PhaseEvent {
            mjd: e.mjd.value(),
            kind: phase_kind_to_string(e.kind),
        })
        .collect())
}

// ─────────────────────────────────────────────────────────────────────────────
// Illumination periods
// ─────────────────────────────────────────────────────────────────────────────

/// Find periods where geocentric Moon illumination is above `kMin` ∈ [0, 1].
///
/// @param startMjd — Window start (MJD).
/// @param endMjd   — Window end (MJD).
/// @param kMin     — Minimum illumination fraction.
/// @returns Array of MJD periods.
#[napi(js_name = "moonIlluminationAbove")]
pub fn moon_illumination_above(
    start_mjd: f64,
    end_mjd: f64,
    k_min: f64,
) -> napi::Result<Vec<MjdPeriod>> {
    let window = make_window(start_mjd, end_mjd)?;
    let periods = illumination_above::<Vsop87Ephemeris>(window, k_min, PhaseSearchOpts::default());
    Ok(periods
        .into_iter()
        .map(|p| MjdPeriod {
            start_mjd: p.start.value(),
            end_mjd: p.end.value(),
        })
        .collect())
}

/// Find periods where geocentric Moon illumination is below `kMax` ∈ [0, 1].
#[napi(js_name = "moonIlluminationBelow")]
pub fn moon_illumination_below(
    start_mjd: f64,
    end_mjd: f64,
    k_max: f64,
) -> napi::Result<Vec<MjdPeriod>> {
    let window = make_window(start_mjd, end_mjd)?;
    let periods = illumination_below::<Vsop87Ephemeris>(window, k_max, PhaseSearchOpts::default());
    Ok(periods
        .into_iter()
        .map(|p| MjdPeriod {
            start_mjd: p.start.value(),
            end_mjd: p.end.value(),
        })
        .collect())
}

/// Find periods where geocentric Moon illumination is in `[kMin, kMax]`.
#[napi(js_name = "moonIlluminationRange")]
pub fn moon_illumination_range(
    start_mjd: f64,
    end_mjd: f64,
    k_min: f64,
    k_max: f64,
) -> napi::Result<Vec<MjdPeriod>> {
    let window = make_window(start_mjd, end_mjd)?;
    let periods =
        illumination_range::<Vsop87Ephemeris>(window, k_min, k_max, PhaseSearchOpts::default());
    Ok(periods
        .into_iter()
        .map(|p| MjdPeriod {
            start_mjd: p.start.value(),
            end_mjd: p.end.value(),
        })
        .collect())
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
