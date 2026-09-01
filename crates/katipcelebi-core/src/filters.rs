// Filters — legacy src/books/filters.py port.

#[derive(Debug, Clone)]
pub struct Filters {
    pub search: String,
    pub search_field: String, // all | title | authors | isbn | publishers
    pub min_rating: u8,
    pub signed: String, // any | yes | no
    pub lent: String,   // any | home | out
    pub status: String, // any | not_read | want_to_read | reading | read
    pub tag: String,
    pub sort: String,   // title | rating | year
    pub asc: bool,
}

impl Default for Filters {
    fn default() -> Self {
        Self { search: String::new(), search_field: "all".into(), min_rating: 0, signed: "any".into(), lent: "any".into(), status: "any".into(), tag: "any".into(), sort: "title".into(), asc: true }
    }
}
