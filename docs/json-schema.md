# Microsite Builder — JSON Schema Guide

This document explains the complete JSON structure that the builder saves and exports.

---

## Top-Level Structure

```json
{
  "version": 4,
  "activePageId": "page_123",
  "theme": { ... },
  "header": { ... },
  "footer": { ... },
  "pages": [ ... ]
}
```

| Field | Type | Purpose |
|-------|------|---------|
| `version` | number | Schema version — used by import to decide migration path |
| `activePageId` | string | Which page is currently open in the editor |
| `theme` | object | Global font and color palette (shared across all pages) |
| `header` | Section | The site header — appears on every page |
| `footer` | Section | The site footer — appears on every page |
| `pages` | Page[] | All content pages |

---

## Theme

```json
"theme": {
  "colors": ["#006e75", "#0b978e", "#333333", "#ffffff", "#f5f5f5", "#e74c3c"],
  "headingFont": "Inter, sans-serif",
  "bodyFont": "Inter, sans-serif"
}
```

| Field | Purpose |
|-------|---------|
| `colors` | Palette swatches shown in the color picker |
| `headingFont` | Default font for heading elements |
| `bodyFont` | Default font used in the exported HTML `<body>` |

> **Note:** See the Global Styling section at the bottom of this document for important limitations and future improvements.

---

## Page

```json
{
  "id": "page_abc",
  "name": "Home",
  "slug": "/",
  "sections": [ ... ]
}
```

| Field | Purpose |
|-------|---------|
| `id` | Unique identifier |
| `name` | Display name shown in the Pages panel |
| `slug` | URL path (e.g. `/`, `/about`, `/contact`) |
| `sections` | Ordered list of content sections for this page |

The full layout for any page is: **Header → Page Sections → Footer**

---

## Section

```json
{
  "id": "sec_abc",
  "label": "Hero",
  "height": 500,

  "backgroundColor": "#ffffff",
  "backgroundType": "solid",

  "columns": 3,
  "columnWidths": [33.33, 33.33, 33.34],
  "columnStyles": {
    "0": { "backgroundColor": "#006e75" },
    "2": { "backgroundType": "linear-gradient", "gradientFrom": "#006e75", "gradientTo": "#0b978e", "gradientAngle": 135 }
  },

  "elements": { ... },
  "order": ["el_1", "el_2"]
}
```

### Section Background

`backgroundType` controls which fields are used:

| `backgroundType` | Fields used |
|-----------------|-------------|
| `"solid"` | `backgroundColor` |
| `"linear-gradient"` | `gradientFrom`, `gradientTo`, `gradientAngle` |
| `"radial-gradient"` | `gradientFrom`, `gradientTo` |
| (any) + image | `backgroundImage` (URL), `backgroundOverlay` (0–1 darkness) |

### Column Layout

| Field | Purpose |
|-------|---------|
| `columns` | Number of columns: 1 (no guides) to 6 |
| `columnWidths` | Array of percentages that add up to 100. Empty when `columns = 1` |
| `columnStyles` | Per-column background. Key is column index (0-based). Only present when a column has styling |

Each entry in `columnStyles` supports the same background fields as the section itself (solid/gradient/image/overlay).

### Elements Storage

`elements` is a **flat record** keyed by element ID:
```json
"elements": {
  "el_1": { ... },
  "el_2": { ... }
}
```

`order` is an **ordered array** of those IDs — this controls z-index layering (last = on top):
```json
"order": ["el_1", "el_2"]
```

This two-field pattern (record + order array) allows O(1) element lookup by ID while preserving render order.

---

## Element

All elements share a common base, then add type-specific fields.

### Common Fields (all types)

```json
{
  "id": "el_abc",
  "type": "text",
  "x": 100,
  "y": 50,
  "width": 300,
  "height": 60,
  "zIndex": 1
}
```

**Position & Size** — coordinates are in pixels, relative to the section's content container (1280px wide on desktop).

**Appearance** (only written when non-default):
```json
{
  "backgroundColor": "#f5f5f5",
  "backgroundType": "solid",
  "borderRadius": 8,
  "borderWidth": 1,
  "borderColor": "#cccccc",
  "borderStyle": "solid"
}
```

**Shadow** (only written when `shadowEnabled: true`):
```json
{
  "shadowEnabled": true,
  "shadowX": 4,
  "shadowY": 4,
  "shadowBlur": 12,
  "shadowSpread": 0,
  "shadowColor": "rgba(0,0,0,0.2)"
}
```

**Padding** (only written when non-zero):
```json
{
  "paddingTop": 12,
  "paddingRight": 16,
  "paddingBottom": 12,
  "paddingLeft": 16
}
```

**Animation** (only written when `animationType` is not `"none"`):
```json
{
  "animationType": "fade-in",
  "animationTrigger": "scroll",
  "animationDuration": 600,
  "animationDelay": 200
}
```

---

### Type-Specific Fields

#### `text`
```json
{
  "type": "text",
  "text": "Hello world",
  "richText": "<b>Hello</b> world",
  "fontSize": 24,
  "fontWeight": "700",
  "fontFamily": "Inter, sans-serif",
  "color": "#333333",
  "textAlign": "left",
  "lineHeight": 1.5
}
```

- `text` — plain text fallback
- `richText` — HTML string from inline editing (bold/italic/links). If present, this is what renders. If empty, `text` renders.

#### `button`
```json
{
  "type": "button",
  "label": "Get Started",
  "fontSize": 15,
  "fontWeight": "600",
  "fontFamily": "Inter, sans-serif",
  "color": "#ffffff"
}
```

#### `image`
```json
{
  "type": "image",
  "src": "https://example.com/photo.jpg",
  "alt": "A photo",
  "objectFit": "cover"
}
```

`objectFit`: `"cover"` | `"contain"` | `"fill"`

#### `video`
```json
{
  "type": "video",
  "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
```

YouTube URLs are auto-converted to embed format on render.

#### `icon`
```json
{
  "type": "icon",
  "iconName": "★",
  "iconSize": 40,
  "color": "#006e75"
}
```

#### `box`, `divider`, `spacer`
No type-specific fields — all appearance is controlled by shared fields (backgroundColor, borderWidth, borderRadius, etc.).

---

### Responsive Overrides

Elements can have different values on tablet (768px) and mobile (375px).
Only the **changed** fields are stored — everything else inherits from desktop.

```json
{
  "type": "text",
  "x": 100, "y": 50, "width": 600, "fontSize": 24,
  "responsiveTablet": {
    "x": 60,
    "width": 400,
    "fontSize": 18
  },
  "responsiveMobile": {
    "hidden": true
  }
}
```

Available override fields:

| Field | Description |
|-------|-------------|
| `x`, `y` | Reposition on this breakpoint |
| `width`, `height` | Resize on this breakpoint |
| `hidden` | Hide completely on this breakpoint |
| `fontSize` | Different font size |
| `fontWeight` | Different font weight |
| `textAlign` | Different text alignment |

Fields not listed here (background, border, shadow, etc.) cannot currently be overridden per-breakpoint — they use the desktop value on all screens.

---

## Complete Example

```json
{
  "version": 4,
  "activePageId": "page_001",
  "theme": {
    "colors": ["#006e75", "#0b978e", "#333333", "#ffffff"],
    "headingFont": "Inter, sans-serif",
    "bodyFont": "Inter, sans-serif"
  },
  "header": {
    "id": "sec_header",
    "label": "Header",
    "height": 80,
    "backgroundColor": "#ffffff",
    "backgroundType": "solid",
    "columns": 1,
    "elements": {
      "el_logo": {
        "id": "el_logo", "type": "text",
        "x": 40, "y": 20, "width": 120, "height": 40, "zIndex": 0,
        "text": "MyBrand", "fontSize": 22, "fontWeight": "700",
        "color": "#006e75", "fontFamily": "Inter, sans-serif"
      }
    },
    "order": ["el_logo"]
  },
  "footer": {
    "id": "sec_footer",
    "label": "Footer",
    "height": 100,
    "backgroundColor": "#f5f5f5",
    "backgroundType": "solid",
    "columns": 1,
    "elements": {},
    "order": []
  },
  "pages": [
    {
      "id": "page_001",
      "name": "Home",
      "slug": "/",
      "sections": [
        {
          "id": "sec_hero",
          "label": "Hero",
          "height": 500,
          "backgroundType": "linear-gradient",
          "gradientFrom": "#006e75",
          "gradientTo": "#0b978e",
          "gradientAngle": 135,
          "columns": 2,
          "columnWidths": [50, 50],
          "elements": {
            "el_title": {
              "id": "el_title", "type": "text",
              "x": 80, "y": 160, "width": 480, "height": 80, "zIndex": 0,
              "text": "Build something great",
              "fontSize": 48, "fontWeight": "700",
              "color": "#ffffff", "fontFamily": "Inter, sans-serif",
              "responsiveMobile": { "fontSize": 28, "width": 300 }
            },
            "el_cta": {
              "id": "el_cta", "type": "button",
              "x": 80, "y": 280, "width": 160, "height": 48, "zIndex": 1,
              "label": "Get Started",
              "backgroundColor": "#ffffff", "color": "#006e75",
              "borderRadius": 6, "fontWeight": "600", "fontSize": 15
            }
          },
          "order": ["el_title", "el_cta"]
        }
      ]
    }
  ]
}
```

---

## Global Styling — Current State vs What's Missing

### What the current `theme` does
- Provides **color swatches** in the color picker UI
- Sets the **default font** in the exported HTML `<body>`
- That's it — it does not affect existing elements

### The problem
Every element stores its own hardcoded color and font:
```json
{ "color": "#006e75", "fontFamily": "Inter, sans-serif" }
```

If you want to change the brand color from teal to blue across the whole site, you have to update **every element manually**. The theme palette is just a convenience picker, not a live connection.

### What proper global styling would look like
Instead of hardcoded values, elements would reference **style tokens**:
```json
{ "color": "$color.primary", "fontFamily": "$font.heading" }
```

Then the theme defines what those tokens resolve to:
```json
"theme": {
  "tokens": {
    "color.primary": "#006e75",
    "color.text": "#333333",
    "font.heading": "Inter, sans-serif"
  }
}
```

Change `color.primary` once → every element using `$color.primary` updates automatically.

### Is it worth adding now?
**Not yet.** It's a significant architectural change (token system, expression resolver, updated UI). The current palette swatches solve 80% of the user's need with 5% of the complexity.

Add it when: users start complaining they have to manually recolor 20 elements every time the brand changes. That's the right signal.
