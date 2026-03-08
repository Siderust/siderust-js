// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Vallés Puig, Ramon

//! Cartesian position type for WebAssembly bindings.

use serde::Serialize;
use wasm_bindgen::prelude::*;

// Frame and center string constants
pub const FRAME_ECL: &str = "EclipticMeanJ2000";
pub const FRAME_EQ: &str = "EquatorialMeanJ2000";
pub const FRAME_ICRS: &str = "ICRS";

pub const CENTER_BARY: &str = "Barycentric";
pub const CENTER_HELIO: &str = "Heliocentric";
pub const CENTER_GEO: &str = "Geocentric";

pub const UNIT_AU: &str = "au";
pub const UNIT_KM: &str = "km";

/// A 3D cartesian position with frame, center, and unit metadata.
#[wasm_bindgen]
#[derive(Clone, Serialize)]
pub struct Position {
    x: f64,
    y: f64,
    z: f64,
    frame: String,
    center: String,
    unit: String,
}

#[wasm_bindgen]
impl Position {
    /// Create a new position with explicit coordinates, frame, center, and unit.
    #[wasm_bindgen(constructor)]
    pub fn new(
        x: f64,
        y: f64,
        z: f64,
        frame: String,
        center: String,
        unit: String,
    ) -> Result<Position, JsError> {
        validate_frame(&frame)?;
        validate_center(&center)?;
        validate_unit(&unit)?;
        Ok(Self { x, y, z, frame, center, unit })
    }

    /// X coordinate.
    #[wasm_bindgen(getter)]
    pub fn x(&self) -> f64 {
        self.x
    }

    /// Y coordinate.
    #[wasm_bindgen(getter)]
    pub fn y(&self) -> f64 {
        self.y
    }

    /// Z coordinate.
    #[wasm_bindgen(getter)]
    pub fn z(&self) -> f64 {
        self.z
    }

    /// Reference frame (e.g., "EclipticMeanJ2000", "ICRS").
    #[wasm_bindgen(getter)]
    pub fn frame(&self) -> String {
        self.frame.clone()
    }

    /// Coordinate center (e.g., "Barycentric", "Heliocentric", "Geocentric").
    #[wasm_bindgen(getter)]
    pub fn center(&self) -> String {
        self.center.clone()
    }

    /// Distance unit ("au" or "km").
    #[wasm_bindgen(getter)]
    pub fn unit(&self) -> String {
        self.unit.clone()
    }

    /// Euclidean distance from origin.
    #[wasm_bindgen]
    pub fn magnitude(&self) -> f64 {
        (self.x * self.x + self.y * self.y + self.z * self.z).sqrt()
    }

    /// Subtract another position to get a displacement vector.
    #[wasm_bindgen]
    pub fn subtract(&self, other: &Position) -> Result<Displacement, JsError> {
        if self.frame != other.frame {
            return Err(JsError::new(&format!(
                "Cannot subtract positions in different frames: '{}' vs '{}'",
                self.frame, other.frame
            )));
        }
        if self.center != other.center {
            return Err(JsError::new(&format!(
                "Cannot subtract positions with different centers: '{}' vs '{}'",
                self.center, other.center
            )));
        }
        if self.unit != other.unit {
            return Err(JsError::new(&format!(
                "Cannot subtract positions with different units: '{}' vs '{}'",
                self.unit, other.unit
            )));
        }
        Ok(Displacement {
            dx: self.x - other.x,
            dy: self.y - other.y,
            dz: self.z - other.z,
            frame: self.frame.clone(),
            unit: self.unit.clone(),
        })
    }

    /// Add a displacement to get a new position.
    #[wasm_bindgen(js_name = "addDisplacement")]
    pub fn add_displacement(&self, d: &Displacement) -> Result<Position, JsError> {
        if self.frame != d.frame {
            return Err(JsError::new(&format!(
                "Cannot add displacement in different frame: '{}' vs '{}'",
                self.frame, d.frame
            )));
        }
        if self.unit != d.unit {
            return Err(JsError::new(&format!(
                "Cannot add displacement with different unit: '{}' vs '{}'",
                self.unit, d.unit
            )));
        }
        Ok(Position {
            x: self.x + d.dx,
            y: self.y + d.dy,
            z: self.z + d.dz,
            frame: self.frame.clone(),
            center: self.center.clone(),
            unit: self.unit.clone(),
        })
    }
}

impl Position {
    /// Internal constructor without validation (for Rust callers).
    pub(crate) fn new_internal(
        x: f64,
        y: f64,
        z: f64,
        frame: &str,
        center: &str,
        unit: &str,
    ) -> Self {
        Self {
            x,
            y,
            z,
            frame: frame.to_string(),
            center: center.to_string(),
            unit: unit.to_string(),
        }
    }
}

/// A displacement vector (difference between two positions).
#[wasm_bindgen]
#[derive(Clone, Serialize)]
pub struct Displacement {
    dx: f64,
    dy: f64,
    dz: f64,
    frame: String,
    unit: String,
}

#[wasm_bindgen]
impl Displacement {
    /// Create a new displacement.
    #[wasm_bindgen(constructor)]
    pub fn new(
        dx: f64,
        dy: f64,
        dz: f64,
        frame: String,
        unit: String,
    ) -> Result<Displacement, JsError> {
        validate_frame(&frame)?;
        validate_unit(&unit)?;
        Ok(Self { dx, dy, dz, frame, unit })
    }

    /// X component of displacement.
    #[wasm_bindgen(getter)]
    pub fn dx(&self) -> f64 {
        self.dx
    }

    /// Y component of displacement.
    #[wasm_bindgen(getter)]
    pub fn dy(&self) -> f64 {
        self.dy
    }

    /// Z component of displacement.
    #[wasm_bindgen(getter)]
    pub fn dz(&self) -> f64 {
        self.dz
    }

    /// Reference frame.
    #[wasm_bindgen(getter)]
    pub fn frame(&self) -> String {
        self.frame.clone()
    }

    /// Distance unit.
    #[wasm_bindgen(getter)]
    pub fn unit(&self) -> String {
        self.unit.clone()
    }

    /// Euclidean magnitude.
    #[wasm_bindgen]
    pub fn magnitude(&self) -> f64 {
        (self.dx * self.dx + self.dy * self.dy + self.dz * self.dz).sqrt()
    }

    /// Scale displacement by a factor.
    #[wasm_bindgen]
    pub fn scale(&self, factor: f64) -> Displacement {
        Displacement {
            dx: self.dx * factor,
            dy: self.dy * factor,
            dz: self.dz * factor,
            frame: self.frame.clone(),
            unit: self.unit.clone(),
        }
    }

    /// Add another displacement.
    #[wasm_bindgen]
    pub fn add(&self, other: &Displacement) -> Result<Displacement, JsError> {
        if self.frame != other.frame || self.unit != other.unit {
            return Err(JsError::new(
                "Cannot add displacements with different frame/unit",
            ));
        }
        Ok(Displacement {
            dx: self.dx + other.dx,
            dy: self.dy + other.dy,
            dz: self.dz + other.dz,
            frame: self.frame.clone(),
            unit: self.unit.clone(),
        })
    }
}

fn validate_frame(f: &str) -> Result<(), JsError> {
    match f {
        FRAME_ECL | FRAME_EQ | FRAME_ICRS | "ICRF" | "EquatorialMeanOfDate" | "EquatorialTrueOfDate" => Ok(()),
        _ => Err(JsError::new(&format!(
            "Unknown frame '{}'. Valid: EclipticMeanJ2000, EquatorialMeanJ2000, ICRS, ICRF",
            f
        ))),
    }
}

fn validate_center(c: &str) -> Result<(), JsError> {
    match c {
        CENTER_BARY | CENTER_HELIO | CENTER_GEO => Ok(()),
        _ => Err(JsError::new(&format!(
            "Unknown center '{}'. Valid: Barycentric, Heliocentric, Geocentric",
            c
        ))),
    }
}

fn validate_unit(u: &str) -> Result<(), JsError> {
    match u {
        UNIT_AU | UNIT_KM => Ok(()),
        _ => Err(JsError::new(&format!(
            "Unknown unit '{}'. Valid: au, km",
            u
        ))),
    }
}
