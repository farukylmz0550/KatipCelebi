// Gamification — mirrors src/lib/gamification.ts but in Rust for low-level perf.

pub const XP_BOOK_ADDED: i32 = 5;
pub const XP_BOOK_FINISHED: i32 = 50;
pub const XP_LENDING_CREATED: i32 = 5;

pub fn level_for_xp(xp: i32) -> i32 {
    let xp = xp.max(0) as f64;
    ( (xp / 50.0).sqrt().floor() as i32 ) + 1
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn levels() {
        assert_eq!(level_for_xp(0), 1);
        assert_eq!(level_for_xp(50), 2);
        assert_eq!(level_for_xp(200), 3);
    }
}
