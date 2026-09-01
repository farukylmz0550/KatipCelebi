// Person & Loan — legacy src/people/model.py port.

pub fn normalize_name(s: &str) -> String {
    s.split_whitespace().collect::<Vec<_>>().join(" ").trim().to_lowercase()
}

pub fn new_person_id() -> String {
    // XXXX-XXXX (hex)
    use std::time::{SystemTime, UNIX_EPOCH};
    let nanos = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_nanos();
    let hex = format!("{:08x}", nanos & 0xffffffff);
    format!("{}-{}", &hex[0..4].to_uppercase(), &hex[4..8].to_uppercase())
}

pub fn trust_score(returned: i32, out: i32) -> i32 {
    returned - out
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn normalize() { assert_eq!(normalize_name("  John   DOE "), "john doe"); }
    #[test]
    fn trust() { assert_eq!(trust_score(5,2), 3); }
}
