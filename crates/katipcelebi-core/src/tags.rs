// Tags — legacy src/books/tags.py port.

pub const MAX_SUBJECT_TAGS: usize = 6;

pub fn canonical(s: &str) -> String {
    s.trim().to_lowercase()
}
pub fn display(s: &str) -> String {
    let c = canonical(s);
    let mut chars = c.chars();
    match chars.next() {
        None => String::new(),
        Some(f) => f.to_uppercase().collect::<String>() + chars.as_str(),
    }
}
pub fn split_tags(s: &str) -> Vec<String> {
    s.split(',').map(|t| canonical(t)).filter(|t| !t.is_empty()).collect()
}
pub fn store(tags: &[String]) -> String {
    tags.iter().map(|t| canonical(t)).collect::<Vec<_>>().join(", ")
}
pub fn from_subjects(subjects: &[String]) -> Vec<String> {
    // Simplified noise filtering — full list in legacy tags.py.
    let noise = ["translations", "fiction", "accessible book"];
    subjects.iter()
        .take(15)
        .map(|s| s.trim().to_lowercase())
        .filter(|s| !noise.iter().any(|n| s.contains(n)))
        .filter(|s| !s.contains(" / ") && !s.contains(" - "))
        .take(MAX_SUBJECT_TAGS)
        .collect()
}
