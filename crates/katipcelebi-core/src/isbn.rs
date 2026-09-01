// ISBN validation — legacy src/books/model.py checksum logic, low-level Rust.

pub enum IsbnError { Empty, Length, Checksum10, Checksum13, Ok }

pub fn normalize_isbn(s: &str) -> String {
    s.chars().filter(|c| c.is_ascii_digit() || *c=='X' || *c=='x').collect()
}

pub fn is_valid_isbn10(s: &str) -> bool {
    let c = normalize_isbn(s);
    if c.len()!=10 { return false; }
    let mut sum=0i32;
    for (i, ch) in c.chars().enumerate() {
        let v = if i==9 && (ch=='X'||ch=='x') {10} else if let Some(d)=ch.to_digit(10) {d as i32} else {return false};
        sum += v * (10 - i as i32);
    }
    sum % 11 == 0
}

pub fn is_valid_isbn13(s: &str) -> bool {
    let c = normalize_isbn(s);
    if c.len()!=13 { return false; }
    let mut sum=0i32;
    for (i,ch) in c.chars().enumerate() {
        let d = match ch.to_digit(10) { Some(v)=>v as i32, None=>return false};
        sum += if i%2==0 {d} else {d*3};
    }
    sum % 10 == 0
}
