// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Vallés Puig, Ramon

//! Altitude and azimuth event queries — thin wasm wrappers over shared core logic.

use serde::Serialize;
use wasm_bindgen::prelude::*;

use siderust_binding_core::events as core_events;
use tempoch::{ModifiedJulianDate, Period, MJD};

use crate::body::{parse_body, to_js};
use crate::observer::Observer;
use crate::star::Star;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CrossingEvent {
    pub mjd: f64,
    pub direction: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CulminationEvent {
    pub mjd: f64,
    pub altitude_deg: f64,
    pub kind: String,
}

#[derive(Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MjdPeriod {
    pub start_mjd: f64,
    pub end_mjd: f64,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AzimuthCrossingEvent {
    pub mjd: f64,
    pub direction: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AzimuthExtremum {
    pub mjd: f64,
    pub azimuth_deg: f64,
    pub kind: String,
}

impl From<core_events::CrossingEventData> for CrossingEvent {
    fn from(event: core_events::CrossingEventData) -> Self {
        Self {
            mjd: event.mjd,
            direction: event.direction.as_str().to_string(),
        }
    }
}

impl From<core_events::CulminationEventData> for CulminationEvent {
    fn from(event: core_events::CulminationEventData) -> Self {
        Self {
            mjd: event.mjd,
            altitude_deg: event.altitude_deg,
            kind: event.kind.as_str().to_string(),
        }
    }
}

impl From<core_events::MjdPeriodData> for MjdPeriod {
    fn from(period: core_events::MjdPeriodData) -> Self {
        Self {
            start_mjd: period.start_mjd,
            end_mjd: period.end_mjd,
        }
    }
}

impl From<core_events::AzimuthCrossingEventData> for AzimuthCrossingEvent {
    fn from(event: core_events::AzimuthCrossingEventData) -> Self {
        Self {
            mjd: event.mjd,
            direction: event.direction.as_str().to_string(),
        }
    }
}

impl From<core_events::AzimuthExtremumData> for AzimuthExtremum {
    fn from(event: core_events::AzimuthExtremumData) -> Self {
        Self {
            mjd: event.mjd,
            azimuth_deg: event.azimuth_deg,
            kind: event.kind.as_str().to_string(),
        }
    }
}

fn into_web_vec<T, U>(items: Vec<T>) -> Vec<U>
where
    U: From<T>,
{
    items.into_iter().map(U::from).collect()
}

#[wasm_bindgen(js_name = "bodyAltitudeAt")]
pub fn body_altitude_at(body: &str, observer: &Observer, mjd: f64) -> Result<f64, JsError> {
    core_events::body_altitude_at(parse_body(body)?, &observer.inner, mjd)
        .map_err(|error| JsError::new(&error))
}

#[wasm_bindgen(js_name = "bodyAzimuthAt")]
pub fn body_azimuth_at(body: &str, observer: &Observer, mjd: f64) -> Result<f64, JsError> {
    core_events::body_azimuth_at(parse_body(body)?, &observer.inner, mjd)
        .map_err(|error| JsError::new(&error))
}

#[wasm_bindgen(js_name = "bodyCrossings")]
pub fn body_crossings(
    body: &str,
    observer: &Observer,
    start_mjd: f64,
    end_mjd: f64,
    threshold_deg: f64,
) -> Result<JsValue, JsError> {
    let result = core_events::body_crossings(
        parse_body(body)?,
        &observer.inner,
        start_mjd,
        end_mjd,
        threshold_deg,
    )
        .map(into_web_vec::<core_events::CrossingEventData, CrossingEvent>)
        .map_err(|error| JsError::new(&error))?;
    to_js(&result)
}

#[wasm_bindgen(js_name = "bodyCulminations")]
pub fn body_culminations(
    body: &str,
    observer: &Observer,
    start_mjd: f64,
    end_mjd: f64,
) -> Result<JsValue, JsError> {
    let result = core_events::body_culminations(
        parse_body(body)?,
        &observer.inner,
        start_mjd,
        end_mjd,
    )
        .map(into_web_vec::<core_events::CulminationEventData, CulminationEvent>)
        .map_err(|error| JsError::new(&error))?;
    to_js(&result)
}

#[wasm_bindgen(js_name = "bodyAboveThreshold")]
pub fn body_above_threshold(
    body: &str,
    observer: &Observer,
    start_mjd: f64,
    end_mjd: f64,
    threshold_deg: f64,
) -> Result<JsValue, JsError> {
    let result = core_events::body_above_threshold(
        parse_body(body)?,
        &observer.inner,
        start_mjd,
        end_mjd,
        threshold_deg,
    )
        .map(into_web_vec::<core_events::MjdPeriodData, MjdPeriod>)
        .map_err(|error| JsError::new(&error))?;
    to_js(&result)
}

#[wasm_bindgen(js_name = "bodyBelowThreshold")]
pub fn body_below_threshold(
    body: &str,
    observer: &Observer,
    start_mjd: f64,
    end_mjd: f64,
    threshold_deg: f64,
) -> Result<JsValue, JsError> {
    let result = core_events::body_below_threshold(
        parse_body(body)?,
        &observer.inner,
        start_mjd,
        end_mjd,
        threshold_deg,
    )
        .map(into_web_vec::<core_events::MjdPeriodData, MjdPeriod>)
        .map_err(|error| JsError::new(&error))?;
    to_js(&result)
}

#[wasm_bindgen(js_name = "bodyAzimuthCrossings")]
pub fn body_azimuth_crossings(
    body: &str,
    observer: &Observer,
    start_mjd: f64,
    end_mjd: f64,
    bearing_deg: f64,
) -> Result<JsValue, JsError> {
    let result = core_events::body_azimuth_crossings(
        parse_body(body)?,
        &observer.inner,
        start_mjd,
        end_mjd,
        bearing_deg,
    )
        .map(into_web_vec::<core_events::AzimuthCrossingEventData, AzimuthCrossingEvent>)
        .map_err(|error| JsError::new(&error))?;
    to_js(&result)
}

#[wasm_bindgen(js_name = "bodyAzimuthExtrema")]
pub fn body_azimuth_extrema(
    body: &str,
    observer: &Observer,
    start_mjd: f64,
    end_mjd: f64,
) -> Result<JsValue, JsError> {
    let result = core_events::body_azimuth_extrema(
        parse_body(body)?,
        &observer.inner,
        start_mjd,
        end_mjd,
    )
        .map(into_web_vec::<core_events::AzimuthExtremumData, AzimuthExtremum>)
        .map_err(|error| JsError::new(&error))?;
    to_js(&result)
}

#[wasm_bindgen(js_name = "starAltitudeAt")]
pub fn star_altitude_at(star: &Star, observer: &Observer, mjd: f64) -> Result<f64, JsError> {
    core_events::star_altitude_at(&star.inner, &observer.inner, mjd)
        .map_err(|error| JsError::new(&error))
}

#[wasm_bindgen(js_name = "starAzimuthAt")]
pub fn star_azimuth_at(star: &Star, observer: &Observer, mjd: f64) -> Result<f64, JsError> {
    core_events::star_azimuth_at(&star.inner, &observer.inner, mjd)
        .map_err(|error| JsError::new(&error))
}

#[wasm_bindgen(js_name = "starCrossings")]
pub fn star_crossings(
    star: &Star,
    observer: &Observer,
    start_mjd: f64,
    end_mjd: f64,
    threshold_deg: f64,
) -> Result<JsValue, JsError> {
    let result = core_events::star_crossings(
        &star.inner,
        &observer.inner,
        start_mjd,
        end_mjd,
        threshold_deg,
    )
        .map(into_web_vec::<core_events::CrossingEventData, CrossingEvent>)
        .map_err(|error| JsError::new(&error))?;
    to_js(&result)
}

#[wasm_bindgen(js_name = "starCulminations")]
pub fn star_culminations(
    star: &Star,
    observer: &Observer,
    start_mjd: f64,
    end_mjd: f64,
) -> Result<JsValue, JsError> {
    let result = core_events::star_culminations(
        &star.inner,
        &observer.inner,
        start_mjd,
        end_mjd,
    )
        .map(into_web_vec::<core_events::CulminationEventData, CulminationEvent>)
        .map_err(|error| JsError::new(&error))?;
    to_js(&result)
}

#[wasm_bindgen(js_name = "starAboveThreshold")]
pub fn star_above_threshold(
    star: &Star,
    observer: &Observer,
    start_mjd: f64,
    end_mjd: f64,
    threshold_deg: f64,
) -> Result<JsValue, JsError> {
    let result = core_events::star_above_threshold(
        &star.inner,
        &observer.inner,
        start_mjd,
        end_mjd,
        threshold_deg,
    )
        .map(into_web_vec::<core_events::MjdPeriodData, MjdPeriod>)
        .map_err(|error| JsError::new(&error))?;
    to_js(&result)
}

#[wasm_bindgen(js_name = "starBelowThreshold")]
pub fn star_below_threshold(
    star: &Star,
    observer: &Observer,
    start_mjd: f64,
    end_mjd: f64,
    threshold_deg: f64,
) -> Result<JsValue, JsError> {
    let result = core_events::star_below_threshold(
        &star.inner,
        &observer.inner,
        start_mjd,
        end_mjd,
        threshold_deg,
    )
        .map(into_web_vec::<core_events::MjdPeriodData, MjdPeriod>)
        .map_err(|error| JsError::new(&error))?;
    to_js(&result)
}

#[wasm_bindgen(js_name = "starAzimuthCrossings")]
pub fn star_azimuth_crossings(
    star: &Star,
    observer: &Observer,
    start_mjd: f64,
    end_mjd: f64,
    bearing_deg: f64,
) -> Result<JsValue, JsError> {
    let result = core_events::star_azimuth_crossings(
        &star.inner,
        &observer.inner,
        start_mjd,
        end_mjd,
        bearing_deg,
    )
        .map(into_web_vec::<core_events::AzimuthCrossingEventData, AzimuthCrossingEvent>)
        .map_err(|error| JsError::new(&error))?;
    to_js(&result)
}

#[wasm_bindgen(js_name = "starAzimuthExtrema")]
pub fn star_azimuth_extrema(
    star: &Star,
    observer: &Observer,
    start_mjd: f64,
    end_mjd: f64,
) -> Result<JsValue, JsError> {
    let result = core_events::star_azimuth_extrema(
        &star.inner,
        &observer.inner,
        start_mjd,
        end_mjd,
    )
        .map(into_web_vec::<core_events::AzimuthExtremumData, AzimuthExtremum>)
        .map_err(|error| JsError::new(&error))?;
    to_js(&result)
}

#[wasm_bindgen(js_name = "intersectPeriods")]
pub fn intersect_periods_js(periods1: JsValue, periods2: JsValue) -> Result<JsValue, JsError> {
    let periods1: Vec<MjdPeriod> =
        serde_wasm_bindgen::from_value(periods1).map_err(|error| JsError::new(&error.to_string()))?;
    let periods2: Vec<MjdPeriod> =
        serde_wasm_bindgen::from_value(periods2).map_err(|error| JsError::new(&error.to_string()))?;
    let p1: Vec<Period<MJD>> = periods1
        .iter()
        .map(|period| {
            Period::new(
                ModifiedJulianDate::new(period.start_mjd),
                ModifiedJulianDate::new(period.end_mjd),
            )
        })
        .collect();
    let p2: Vec<Period<MJD>> = periods2
        .iter()
        .map(|period| {
            Period::new(
                ModifiedJulianDate::new(period.start_mjd),
                ModifiedJulianDate::new(period.end_mjd),
            )
        })
        .collect();
    let result: Vec<MjdPeriod> = tempoch::intersect_periods(&p1, &p2)
        .into_iter()
        .map(|period| MjdPeriod {
            start_mjd: period.start.value(),
            end_mjd: period.end.value(),
        })
        .collect();
    to_js(&result)
}
