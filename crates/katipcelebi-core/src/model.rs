// Book model — legacy src/books/model.py port.
// Pure data + validation, no I/O.

pub const LOCAL_KEY_PREFIX: &str = "local_";
pub const MAX_COPIES: u32 = 999;

#[derive(Debug, Clone, PartialEq)]
pub struct Book {
    pub key: String,
    pub title: String,
    pub subtitle: String,
    pub authors: String,
    pub publishers: String,
    pub publish_date: String,
    pub publish_places: String,
    pub edition_name: String,
    pub series: String,
    pub number_of_pages: String,
    pub languages: String,
    pub isbn_10: String,
    pub isbn_13: String,
    pub subjects: String,
    pub rating: String,
    pub notes: String,
    pub status: String,
    pub tags: String,
    pub started_date: String,
    pub finished_date: String,
    pub signed: String,
    pub copies: String,
}

impl Default for Book {
    fn default() -> Self {
        Self {
            key: String::new(),
            title: String::new(),
            subtitle: String::new(),
            authors: String::new(),
            publishers: String::new(),
            publish_date: String::new(),
            publish_places: String::new(),
            edition_name: String::new(),
            series: String::new(),
            number_of_pages: String::new(),
            languages: String::new(),
            isbn_10: String::new(),
            isbn_13: String::new(),
            subjects: String::new(),
            rating: String::new(),
            notes: String::new(),
            status: String::new(),
            tags: String::new(),
            started_date: String::new(),
            finished_date: String::new(),
            signed: String::new(),
            copies: String::new(),
        }
    }
}

impl Book {
    pub fn new_local_key() -> String {
        format!("{}{}", LOCAL_KEY_PREFIX, uuid_simple())
    }
    pub fn is_local_key(&self) -> bool {
        self.key.starts_with(LOCAL_KEY_PREFIX)
    }
    pub fn display_isbn(&self) -> String {
        if self.is_local_key() { String::new() } else { self.key.clone() }
    }
    pub fn copy_count(&self) -> u32 {
        parse_copies(&self.copies)
    }
}

pub fn parse_copies(s: &str) -> u32 {
    let t = s.trim();
    if t.is_empty() { return 1; }
    match t.parse::<i32>() {
        Ok(n) if n >= 1 && n <= MAX_COPIES as i32 => n as u32,
        Ok(n) if n < 1 => 1,
        Ok(n) if n > MAX_COPIES as i32 => MAX_COPIES,
        _ => 1,
    }
}

pub fn parse_rating(s: &str) -> u8 {
    let t = s.trim();
    if t.is_empty() { return 0; }
    if let Ok(f) = t.parse::<f64>() {
        let n = f as i32;
        return n.clamp(0, 5) as u8;
    }
    0
}

fn uuid_simple() -> String {
    // Cheap pseudo-uuid without external crate — hex of time nanos.
    use std::time::{SystemTime, UNIX_EPOCH};
    let nanos = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_nanos();
    format!("{:012x}", nanos & 0xffffffffffff)
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn copy_parse() {
        assert_eq!(parse_copies(""), 1);
        assert_eq!(parse_copies("3"), 3);
        assert_eq!(parse_copies("9999"), 999);
        assert_eq!(parse_copies("banana"), 1);
    }
    #[test]
    fn rating_parse() {
        assert_eq!(parse_rating("5"), 5);
        assert_eq!(parse_rating("banana"), 0);
        assert_eq!(parse_rating("10"), 5);
    }
}
