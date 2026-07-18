# Katip Celebi
# Copyright (C) 2026 farukylmz0550
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <https://www.gnu.org/licenses/>.

"""How round things are, and how big the words are.

The other half of Material 3 Expressive. The colour engine gives us the
palette; the shape scale and the type scale are Google's too, but they live in
a stylesheet rather than in a library, so they are written out here.

Named rather than typed in place. The old stylesheet had 5px, 6px and 8px
corners and font sizes of 11, 12, 14, 15, 19, 22 and 34 -- numbers nobody
chose so much as arrived at. M3 has a scale with seven steps and a reason for
each; using it means a shape can be asked for by what it is.

No Qt in this file: it is a list of numbers and the names for them.
"""

# ------------------------------------------------------------ the corners ---
# M3's shape scale. Expressive is the round end of it: buttons are pills, and
# a container is properly round rather than slightly softened.
NONE = 0
EXTRA_SMALL = 4
SMALL = 8
MEDIUM = 12
LARGE = 16
EXTRA_LARGE = 28
# A pill. M3's "full" shape is a radius of half the height, and for the app's
# 40px-high buttons that is 20. It is written as the real number, not a huge
# one: Qt's stylesheet does not clamp an oversized radius down to a clean pill
# -- give it 999 and it renders a soft-cornered box instead -- so the pill has
# to be told its actual size, and the buttons a matching height to meet it.
PILL = 20
BUTTON_HEIGHT = 40
# Kept for anything whose height is unknown; the pill above is what the
# buttons, the search bar and the navigation actually use.
FULL = 999

# -------------------------------------------------------------- the words ---
# M3's type scale, in the sizes this app actually reaches for. The names are
# Google's; the numbers are the "medium" step of each, which is the one meant
# for a desktop's density.
DISPLAY_SMALL = 30
HEADLINE_SMALL = 22
TITLE_LARGE = 18
TITLE_MEDIUM = 15
BODY_LARGE = 14
BODY_MEDIUM = 13
LABEL_LARGE = 12
LABEL_SMALL = 11

# Expressive leans on weight rather than size to say what matters. Regular for
# body, medium for the labels on buttons and tabs (M3's own weight for those),
# and bold for the things that have to carry a heading.
REGULAR = 400
MEDIUM = 500
BOLD = 700

METRICS = {
    "r_none": NONE,
    "r_xs": EXTRA_SMALL,
    "r_sm": SMALL,
    "r_md": MEDIUM,
    "r_lg": LARGE,
    "r_xl": EXTRA_LARGE,
    "r_pill": PILL,
    "button_h": BUTTON_HEIGHT,
    "r_full": FULL,
    "t_display": DISPLAY_SMALL,
    "t_headline": HEADLINE_SMALL,
    "t_title_lg": TITLE_LARGE,
    "t_title_md": TITLE_MEDIUM,
    "t_body_lg": BODY_LARGE,
    "t_body_md": BODY_MEDIUM,
    "t_label_lg": LABEL_LARGE,
    "t_label_sm": LABEL_SMALL,
    "w_regular": REGULAR,
    "w_medium": MEDIUM,
    "w_bold": BOLD,
}
