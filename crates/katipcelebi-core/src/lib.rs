// KatipCelebi Core — low-level domain logic in Rust.
// Each module = one responsibility (SRP), mirroring legacy src/books/* split.

pub mod model;
pub mod reading;
pub mod tags;
pub mod filters;
pub mod gamification;
pub mod isbn;
pub mod person;
pub mod goal;

pub use model::{Book, MAX_COPIES, LOCAL_KEY_PREFIX};
pub use reading::{BookStatus, status_of, reading_days, format_duration};
pub use tags::{canonical, display as tag_display, from_subjects};
pub use filters::Filters;
pub use person::{normalize_name, trust_score};
pub use goal::{Goal, yearly_goal, monthly_goal};
