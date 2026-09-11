# Book Shelf — Brand Set

The Book Shelf logo, brand assets, and all materials in this directory are licensed under the **CC BY-NC-ND 4.0** license.

**The Book Shelf name, logo, and brand identity are not licensed under the GNU GPLv3.** Use of the Book Shelf source code under the GNU GPLv3 does not grant any trademark rights to use the Book Shelf name or brand identity. Forked and modified versions must use a different project name and brand identity.

---

## Master Files (source of truth)

All icons and logos are rendered from the masters. Never edit generated files directly — regenerate them from the masters.

| File | Purpose |
|---|---|
| `Bookshelf — Color Master.svg` | Full-color logo — **primary master**, source of every colored asset |
| `Bookshelf — Symbolic Master.svg` | Monochrome/symbolic usage (masks, monochrome UI contexts) |

Masters are kept in both the repository root and this directory.

## Generated Icons (`icons/`)

Rendered from `Bookshelf — Color Master.svg` with librsvg (`rsvg-convert` / ImageMagick):

| File | Size | Used for |
|---|---|---|
| `icon.svg` / `logo.svg` | 128 viewBox | Favicon (SVG), in-app logo references |
| `icon-192.png` | 192×192 | Manifest icon, SW notification icon/badge, fallback favicon |
| `icon-512.png` | 512×512 | PWA launcher icon |
| `icon.png` | 512×512 | General-purpose raster master |
| `apple-touch-icon.png` | 180×180 | iOS home screen icon |
| `favicon.ico` | 16/32/48 | Legacy favicon |

## Regeneration

```bash
# SVG copies
cp "Bookshelf — Color Master.svg" public/icon.svg
cp "Bookshelf — Color Master.svg" public/logo.svg

# Rasters (librsvg delegate required: magick -list format | grep SVG)
magick -background none "Bookshelf — Color Master.svg" -resize 192x192 icon-192.png
magick -background none "Bookshelf — Color Master.svg" -resize 512x512 icon-512.png
magick -background none "Bookshelf — Color Master.svg" -resize 512x512 icon.png
magick -background none "Bookshelf — Color Master.svg" -resize 180x180 apple-touch-icon.png
magick -background none "Bookshelf — Color Master.svg" -define icon:auto-resize=16,32,48 favicon.ico
```

## Usage Rules

- The brand name is **Book Shelf** (two words) in every user-facing reference.
- Do **not** use trademark symbols (®/™) with the brand.
- Technical identifiers (package name, routes, variables, cache keys) keep the readable lowercase form `bookshelf`.
- Do not recolor, distort, or rearrange the masters.
