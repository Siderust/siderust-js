// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 Vallés Puig, Ramon

//! Position and displacement logic shared between Node and Web bindings.

// Frame and center string constants
pub const FRAME_ECL: &str = "EclipticMeanJ2000";
pub const FRAME_EQ: &str = "EquatorialMeanJ2000";
pub const FRAME_ICRS: &str = "ICRS";
pub const FRAME_ICRF: &str = "ICRF";
pub const FRAME_EMOD: &str = "EquatorialMeanOfDate";
pub const FRAME_ETOD: &str = "EquatorialTrueOfDate";
pub const FRAME_GAL: &str = "Galactic";

pub const CENTER_BARY: &str = "Barycentric";
pub const CENTER_HELIO: &str = "Heliocentric";
pub const CENTER_GEO: &str = "Geocentric";

pub const UNIT_AU: &str = "au";
pub const UNIT_KM: &str = "km";

/// Validate a frame name.
pub fn validate_frame(f: &str) -> Result<(), String> {
    match f {
        FRAME_ECL | FRAME_EQ | FRAME_ICRS | FRAME_ICRF | FRAME_EMOD | FRAME_ETOD | FRAME_GAL => {
            Ok(())
        }
        _ => Err(format!(
            "Unknown frame '{}'. Valid: EclipticMeanJ2000, EquatorialMeanJ2000, ICRS, ICRF, \
             EquatorialMeanOfDate, EquatorialTrueOfDate, Galactic",
            f
        )),
    }
}

/// Validate a center name.
pub fn validate_center(c: &str) -> Result<(), String> {
    match c {
        CENTER_BARY | CENTER_HELIO | CENTER_GEO => Ok(()),
        _ => Err(format!(
            "Unknown center '{}'. Valid: Barycentric, Heliocentric, Geocentric",
            c
        )),
    }
}

/// Validate a unit name.
pub fn validate_unit(u: &str) -> Result<(), String> {
    match u {
        UNIT_AU | UNIT_KM => Ok(()),
        _ => Err(format!("Unknown unit '{}'. Valid: au, km", u)),
    }
}

/// Core position data without binding-specific attributes.
#[derive(Debug, Clone)]
pub struct PositionData {
    pub x: f64,
    pub y: f64,
    pub z: f64,
    pub frame: String,
    pub center: String,
    pub unit: String,
}

impl PositionData {
    /// Create a new position, validating frame, center, and unit.
    pub fn new(
        x: f64,
        y: f64,
        z: f64,
        frame: String,
        center: String,
        unit: String,
    ) -> Result<Self, String> {
        validate_frame(&frame)?;
        validate_center(&center)?;
        validate_unit(&unit)?;
        Ok(Self { x, y, z, frame, center, unit })
    }

    /// Create without validation (for internal use).
    pub fn new_unchecked(
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

    /// Euclidean magnitude.
    pub fn magnitude(&self) -> f64 {
        (self.x * self.x + self.y * self.y + self.z * self.z).sqrt()
    }

    /// Subtract another position.
    pub fn subtract(&self, other: &PositionData) -> Result<DisplacementData, String> {
        if self.frame != other.frame {
            return Err(format!(
                "Cannot subtract positions in different frames: '{}' vs '{}'",
                self.frame, other.frame
            ));
        }
        if self.center != other.center {
            return Err(format!(
                "Cannot subtract positions with different centers: '{}' vs '{}'",
                self.center, other.center
            ));
        }
        if self.unit != other.unit {
            return Err(format!(
                "Cannot subtract positions with different units: '{}' vs '{}'",
                self.unit, other.unit
            ));
        }
        Ok(DisplacementData {
            dx: self.x - other.x,
            dy: self.y - other.y,
            dz: self.z - other.z,
            frame: self.frame.clone(),
            unit: self.unit.clone(),
        })
    }

    /// Add a displacement.
    pub fn add_displacement(&self, d: &DisplacementData) -> Result<PositionData, String> {
        if self.frame != d.frame {
            return Err(format!(
                "Cannot add displacement in different frame: '{}' vs '{}'",
                self.frame, d.frame
            ));
        }
        if self.unit != d.unit {
            return Err(format!(
                "Cannot add displacement with different unit: '{}' vs '{}'",
                self.unit, d.unit
            ));
        }
        Ok(PositionData {
            x: self.x + d.dx,
            y: self.y + d.dy,
            z: self.z + d.dz,
            frame: self.frame.clone(),
            center: self.center.clone(),
            unit: self.unit.clone(),
        })
    }
}

/// Core displacement data without binding-specific attributes.
#[derive(Debug, Clone)]
pub struct DisplacementData {
    pub dx: f64,
    pub dy: f64,
    pub dz: f64,
    pub frame: String,
    pub unit: String,
}

impl DisplacementData {
    /// Create a new displacement, validating frame and unit.
    pub fn new(
        dx: f64,
        dy: f64,
        dz: f64,
        frame: String,
        unit: String,
    ) -> Result<Self, String> {
        validate_frame(&frame)?;
        validate_unit(&unit)?;
        Ok(Self { dx, dy, dz, frame, unit })
    }

    /// Euclidean magnitude.
    pub fn magnitude(&self) -> f64 {
        (self.dx * self.dx + self.dy * self.dy + self.dz * self.dz).sqrt()
    }

    /// Scale by a factor.
    pub fn scale(&self, factor: f64) -> Self {
        Self {
            dx: self.dx * factor,
            dy: self.dy * factor,
            dz: self.dz * factor,
            frame: self.frame.clone(),
            unit: self.unit.clone(),
        }
    }

    /// Add another displacement.
    pub fn add(&self, other: &DisplacementData) -> Result<Self, String> {
        if self.frame != other.frame || self.unit != other.unit {
            return Err("Cannot add displacements with different frame/unit".to_string());
        }
        Ok(Self {
            dx: self.dx + other.dx,
            dy: self.dy + other.dy,
            dz: self.dz + other.dz,
            frame: self.frame.clone(),
            unit: self.unit.clone(),
        })
    }
}
