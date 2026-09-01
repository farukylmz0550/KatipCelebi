// Reading — legacy src/books/reading.py port.

pub const NOT_READ: &str = "not_read";
pub const WANT_TO_READ: &str = "want_to_read";
pub const READING: &str = "reading";
pub const READ: &str = "read";
pub const STATUS_ANY: &str = "any";
pub const STATUSES: &[&str] = &[NOT_READ, WANT_TO_READ, READING, READ];

pub const WEB_TO_READ: &str = "TO_READ";

#[derive(Debug, Clone, PartialEq)]
pub enum BookStatus {
    NotRead,
    WantToRead,
    Reading,
    Finished,
}

pub fn status_of(s: &str) -> &str {
    let t = s.trim();
    if STATUSES.contains(&t) { t } else { NOT_READ }
}

/// Maps web BookStatus to legacy — TO_READ == WANT_TO_READ in web.
pub fn normalize_web_status(web: &str) -> &str {
    match web {
        "TO_READ" => WANT_TO_READ,
        "READING" => READING,
        "FINISHED" => READ,
        other => status_of(other),
    }
}

pub fn reading_days(started: &str, finished: &str) -> Option<f64> {
    let s = parse_naive(started)?;
    let f = parse_naive(finished)?;
    if f < s { return None; }
    Some((f - s).num_seconds() as f64 / 86400.0)
}

fn parse_naive(s: &str) -> Option<chrono::NaiveDateTime> {
    let t = s.trim();
    if t.is_empty() { return None; }
    // Try ISO 8601 without tz; strip offset if present.
    let without_tz = t.split('+').next().unwrap_or(t).split('Z').next().unwrap_or(t);
    chrono::NaiveDateTime::parse_from_str(without_tz, "%Y-%m-%dT%H:%M:%S").ok()
        .or_else(|| chrono::NaiveDateTime::parse_from_str(without_tz, "%Y-%m-%d %H:%M:%S").ok())
        .or_else(|| chrono::NaiveDate::parse_from_str(&without_tz[..10.min(without_tz.len())], "%Y-%m-%d").ok().map(|d| d.and_hms_opt(0,0,0).unwrap()))
}

pub fn format_duration(days: Option<f64>) -> String {
    match days {
        None => "unknown".to_string(),
        Some(d) if d * 1440.0 < 1.0 => "under a minute".to_string(),
        Some(d) => {
            let total_mins = (d * 1440.0).round() as i64;
            let days = total_mins / 1440;
            let hours = (total_mins % 1440) / 60;
            let mins = total_mins % 60;
            let mut parts: Vec<String> = Vec::new();
            if days > 0 { parts.push(format!("{} day{}", days, if days==1 {""} else {"s"})); }
            if hours > 0 { parts.push(format!("{} hour{}", hours, if hours==1 {""} else {"s"})); }
            if mins > 0 && parts.len() < 2 { parts.push(format!("{} minute{}", mins, if mins==1 {""} else {"s"})); }
            parts.truncate(2);
            if parts.is_empty() { "under a minute".to_string() } else { parts.join(" ") }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn status_fallback() { assert_eq!(status_of("banana"), NOT_READ); }
}
