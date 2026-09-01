// Goal — legacy src/stats/goals.py + summary.py Goal port.

#[derive(Debug, Clone, PartialEq)]
pub struct Goal {
    pub target: i32,
    pub done: i32,
}

impl Goal {
    pub fn new(target: i32, done: i32) -> Self { Self { target, done } }
    pub fn reached(&self) -> bool { self.target > 0 && self.done >= self.target }
    pub fn fraction(&self) -> f64 {
        if self.target <= 0 { 0.0 } else { (self.done as f64 / self.target as f64).min(1.0) }
    }
}

pub fn yearly_goal(target: i32, finished_this_year: i32) -> Goal { Goal::new(target, finished_this_year) }
pub fn monthly_goal(target: i32, finished_this_month: i32) -> Goal { Goal::new(target, finished_this_month) }

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn goal_frac() {
        let g = Goal::new(10, 5);
        assert_eq!(g.fraction(), 0.5);
        assert!(!g.reached());
        let g2 = Goal::new(0, 5);
        assert_eq!(g2.fraction(), 0.0);
    }
}
