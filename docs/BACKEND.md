# Microsite Builder — Complete Schema Reference

The builder saves and loads a single JSON document called **BuilderState**. Store it verbatim; return it verbatim. Every property is documented below.

---

## Table of Contents

1. [Top-Level Structure](#1-top-level-structure)
2. [site](#2-site)
3. [theme](#3-theme)
4. [pages](#4-pages)
5. [nodes — overview](#5-nodes--overview)
6. [Section node](#6-section-node)
7. [GridCell node](#7-gridcell-node)
8. [CanvasElement node](#8-canvaselement-node)
9. [Container node](#9-container-node)
10. [Carousel node](#10-carousel-node)
11. [Accordion node](#11-accordion-node)
12. [Shared style objects](#12-shared-style-objects)
13. [Form fields](#13-form-fields)
14. [Element actions](#14-element-actions)
15. [Responsive overrides](#15-responsive-overrides)
16. [How the tree is connected](#16-how-the-tree-is-connected)
17. [Storage & migration rules](#17-storage--migration-rules)

---

## 1. Top-Level Structure

```json
{
  "schema":       "2.0",
  "activePageId": "page-1",
  "site":         { ... },
  "theme":        { ... },
  "pages":        [ ... ],
  "nodes":        { "node-id": { ... } }
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `schema` | `string` | ✅ | Schema version. Current value: `"2.0"`. Used by the frontend for migration. |
| `activePageId` | `string` | ✅ | ID of the page the editor will open. Must match one of `pages[].id`. |
| `site` | object | ✅ | Global site metadata (name, favicon, language). |
| `theme` | object | ✅ | Global color tokens and font families applied site-wide. |
| `pages` | array | ✅ | Ordered list of site pages. Minimum 1. |
| `nodes` | object | ✅ | Flat map of **every** node in the document, keyed by the node's `id`. |

---

## 2. `site`

Global metadata that applies to the whole site.

```json
{
  "name":     "Acme Corp",
  "favicon":  "https://cdn.example.com/favicon.png",
  "language": "en"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | `string` | ✅ | Site or brand name. Displayed in the editor header. |
| `favicon` | `string` | ✅ | URL or base64 data-URI of the site favicon. |
| `language` | `string` | ✅ | BCP-47 language tag (e.g. `"en"`, `"fr"`, `"de"`). Used in `<html lang="">`. |

---

## 3. `theme`

Design tokens applied site-wide. The editor has an "Apply Theme" button that stamps these values onto existing elements.

```json
{
  "colors": {
    "primary":    "#006e75",
    "text":       "#333333",
    "background": "#ffffff",
    "light":      "#f5f5f5",
    "accent":     "#e74c3c",
    "sectionBg":  "#ffffff",
    "secondary":  "#888888"
  },
  "fonts": {
    "body":    "Inter, sans-serif",
    "heading": "Inter, sans-serif"
  }
}
```

### `theme.colors`

| Field | Type | Required | Description |
|---|---|---|---|
| `primary` | `string` (hex) | ✅ | Brand primary color. Applied to buttons and icons on creation and via Apply Theme. |
| `text` | `string` (hex) | ✅ | Default text color. Applied to all text elements on creation, Apply Theme, and as the HTML `<body>` color on export. |
| `background` | `string` (hex) | ✅ | Page / body background color. Used on HTML export and Apply Theme. |
| `light` | `string` (hex) | ✅ | Light fill color. Applied to box and divider elements on creation and Apply Theme. |
| `accent` | `string` (hex) | ✅ | Accent color. Used for accent-style buttons via Apply Theme. |
| `sectionBg` | `string` (hex) | ✅ | Default background color for newly created sections and via Apply Theme. |
| `secondary` | `string` (hex) | ❌ | Legacy back-compat field. Not exposed in the UI. Preserve on round-trip but do not use. |

### `theme.fonts`

| Field | Type | Required | Description |
|---|---|---|---|
| `body` | `string` | ✅ | CSS font-family stack for body text (e.g. `"Inter, sans-serif"`). |
| `heading` | `string` | ❌ | CSS font-family stack for headings. Falls back to `body` if absent. |

---

## 4. `pages`

An ordered array of pages. Each page references its sections by ID.

```json
{
  "id":   "page-1",
  "name": "Home",
  "slug": "/",
  "seo": {
    "title":       "Home | Acme Corp",
    "description": "Welcome to Acme Corp",
    "ogImage":     "https://cdn.example.com/og.jpg"
  },
  "sections":    ["section-header", "section-hero", "section-footer"],
  "layoutWidth": "fixed",
  "maxWidth":    1280
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | ✅ | Unique page identifier. |
| `name` | `string` | ✅ | Display name shown in the Pages panel in the editor. |
| `slug` | `string` | ✅ | URL path for the page, e.g. `"/"` or `"/about"`. |
| `seo.title` | `string` | ✅ | Value for the HTML `<title>` tag. |
| `seo.description` | `string` | ✅ | Value for `<meta name="description">`. |
| `seo.ogImage` | `string` | ✅ | URL used for the Open Graph `og:image` meta tag. |
| `sections` | `string[]` | ✅ | **Ordered** array of Section node IDs. Determines the top-to-bottom render order of rows on the page. |
| `layoutWidth` | `"fixed"` \| `"fluid"` | ❌ | Whether the page uses a fixed max-width or stretches full-width. Default: `"fixed"`. |
| `maxWidth` | `number` | ❌ | Maximum content width in px when `layoutWidth` is `"fixed"`. Default: `1280`. |

---

## 5. `nodes` — Overview

`nodes` is a flat `{ id → node }` map. Every section, column, and element in the entire document lives here. Nodes reference each other by ID through their `children` arrays.

### Node types

| `type` value | What it represents |
|---|---|
| `"section"` | A full-width horizontal row on a page |
| `"grid-cell"` | A column inside a section or container |
| `"text"` | A rich-text / plain-text element |
| `"image"` | An image element |
| `"button"` | A clickable button element |
| `"box"` | A styled container box (decorative / layout) |
| `"divider"` | A horizontal or vertical rule |
| `"video"` | A video embed element |
| `"spacer"` | An empty space element |
| `"icon"` | An SVG icon element |
| `"form"` | A form element with configurable fields |
| `"container"` | A nested layout wrapper inside a grid-cell |
| `"carousel"` | A slideshow component |
| `"accordion"` | A collapsible FAQ / expandable content component |

---

## 6. Section Node

A section is a full-width row of the page. Every page's content is divided into sections. There are three layout modes — determined by the `layoutMode` field.

```json
{
  "id":           "section-hero",
  "type":         "section",
  "role":         "section",
  "label":        "Hero",
  "layoutMode":   "grid",
  "layout":       { "height": 500 },
  "style":        { ... },
  "children":     ["cell-1", "cell-2"],
  "scrollBehavior": "normal",
  "stickyOffset": 0,
  "cssPosition":  "relative",
  "responsive":   { "tablet": { "height": 400 }, "mobile": { "height": 300 } },
  "hidden":       false,
  "grid": {
    "gap":          24,
    "rowGap":       24,
    "minHeight":    300,
    "contentWidth": "constrained",
    "maxWidth":     1200
  }
}
```

### Section base fields

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | ✅ | Unique node identifier. |
| `type` | `"section"` | ✅ | Discriminator — always `"section"`. |
| `role` | `"header"` \| `"footer"` \| `"section"` | ✅ | Semantic role. `"header"` and `"footer"` are rendered pinned to top/bottom on export. |
| `label` | `string` | ✅ | Display name shown in the Layers panel. |
| `layoutMode` | `"free"` \| `"grid"` \| `"flex"` | ✅ | Controls how children are laid out (see table below). |
| `layout.height` | `number` | ✅ | Section height in px (desktop). |
| `style` | object | ✅ | Visual style — see [SectionStyle](#sectionstyle). |
| `children` | `string[]` | ✅ | Ordered child IDs. What they point to depends on `layoutMode`. |
| `scrollBehavior` | `"normal"` \| `"sticky"` \| `"fixed"` | ❌ | How the section behaves on page scroll. Default: `"normal"`. |
| `stickyOffset` | `number` | ❌ | Top offset in px when `scrollBehavior` is `"sticky"`. Default: `0`. |
| `cssPosition` | `"relative"` \| `"absolute"` \| `"fixed"` \| `"sticky"` | ❌ | CSS `position` override. Default: `"relative"`. |
| `responsive` | object | ❌ | Breakpoint overrides for height, gap, padding, hidden. |
| `hidden` | `boolean` | ❌ | Hides the section on the canvas and in preview. Default: `false`. |

### `layoutMode` explained

| `layoutMode` | `children` holds | Extra required field |
|---|---|---|
| `"free"` | CanvasElement IDs — elements are absolutely positioned via `layout.x/y` | — |
| `"grid"` | GridCell IDs — cells share a 12-column CSS grid | `grid` |
| `"flex"` | GridCell IDs — cells are laid out in a flexbox row/column | `grid` + `flex` |

### `grid` (grid and flex sections)

| Field | Type | Required | Description |
|---|---|---|---|
| `gap` | `number` | ✅ | Horizontal gap between cells in px. |
| `rowGap` | `number` | ✅ | Vertical gap between rows in px. |
| `minHeight` | `number` | ❌ | Minimum section height in px. |
| `rowHeight` | `number` | ❌ | Fixed row height in px (grid only). |
| `contentWidth` | `"constrained"` \| `"full"` | ❌ | Whether the cell content area is capped at `maxWidth` or stretches full. Default: `"constrained"`. |
| `maxWidth` | `number` | ❌ | Max width of the inner content area in px. Default: `1280`. |

### `flex` (flex sections only)

| Field | Type | Required | Description |
|---|---|---|---|
| `direction` | `"row"` \| `"column"` \| `"row-reverse"` \| `"column-reverse"` | ✅ | CSS `flex-direction`. |
| `justify` | `"flex-start"` \| `"center"` \| `"flex-end"` \| `"space-between"` \| `"space-around"` | ✅ | CSS `justify-content`. |
| `align` | `"flex-start"` \| `"center"` \| `"flex-end"` \| `"stretch"` | ✅ | CSS `align-items`. |
| `wrap` | `boolean` | ✅ | CSS `flex-wrap`. |

### Section responsive overrides

```json
"responsive": {
  "tablet": { "height": 400, "gap": 16, "rowGap": 16, "padding": { "top": 24 }, "hidden": false },
  "mobile": { "height": 300, "hidden": false }
}
```

| Field | Type | Description |
|---|---|---|
| `height` | `number` | Override section height at this breakpoint. |
| `gap` | `number` | Override horizontal cell gap. |
| `rowGap` | `number` | Override vertical row gap. |
| `padding` | `Partial<Padding>` | Override any padding sides. |
| `hidden` | `boolean` | Hide the section entirely at this breakpoint. |

### SectionStyle

```json
{
  "background": { ... },
  "columns": {
    "count":  12,
    "widths": [],
    "styles": {}
  },
  "padding": { "top": 60, "right": 0, "bottom": 60, "left": 0 },
  "margin":  { "top": 0, "right": 0, "bottom": 0, "left": 0 },
  "border":  { ... },
  "shadow":  { ... }
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `background` | `SectionBackground` | ✅ | Section background — see [SectionBackground](#elementbackground--sectionbackground). |
| `columns.count` | `number` | ✅ | Number of guide columns shown in the editor. Does not affect layout. |
| `columns.widths` | `number[]` | ✅ | Custom column widths (editor guide only). Empty array = equal widths. |
| `columns.styles` | `object` | ✅ | Per-column background overrides (editor guide only). Usually `{}`. |
| `padding` | `Padding` | ✅ | Section inner padding in px — see [Padding](#padding). |
| `margin` | `Padding` | ❌ | Section outer margin in px. |
| `border` | `Border` | ❌ | Section border — see [Border](#border). |
| `shadow` | `Shadow` | ❌ | Section box shadow — see [Shadow](#shadow). |

---

## 7. GridCell Node

A column within a `grid` or `flex` section, or inside a `container`. Its `children` are the actual content elements.

```json
{
  "id":         "cell-1",
  "type":       "grid-cell",
  "parent":     "section-hero",
  "columnSpan": 6,
  "rowSpan":    1,
  "style": {
    "layoutMode":     "column",
    "gap":            16,
    "padding":        { "top": 24, "right": 24, "bottom": 24, "left": 24 },
    "background":     { "type": "transparent", ... },
    "border":         { "radius": 0, "width": 0, "color": "#cccccc", "style": "none" },
    "minHeight":      200,
    "alignItems":     "flex-start",
    "justifyContent": "flex-start"
  },
  "children":   ["el-heading", "el-button"],
  "responsive": {
    "tablet": { "columnSpan": 12 },
    "mobile": { "columnSpan": 12, "hidden": false }
  }
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | ✅ | Unique node identifier. |
| `type` | `"grid-cell"` | ✅ | Discriminator. |
| `parent` | `string` | ✅ | ID of the parent Section or Container node. |
| `columnSpan` | `number` | ✅ | How many columns (out of 12) this cell occupies. |
| `rowSpan` | `number` | ✅ | How many grid rows this cell spans (usually `1`). |
| `style.layoutMode` | `"column"` \| `"row"` \| `"wrap"` | ✅ | How children inside this cell are stacked: `"column"` = vertical stack, `"row"` = horizontal row, `"wrap"` = wrapping flex. |
| `style.gap` | `number` | ✅ | Gap between children elements in px. |
| `style.padding` | `Padding` | ✅ | Inner padding of the cell in px. |
| `style.background` | `SectionBackground` | ✅ | Cell background. |
| `style.border` | `Border` | ❌ | Cell border. |
| `style.minHeight` | `number` | ❌ | Minimum cell height in px. |
| `style.alignItems` | `"flex-start"` \| `"center"` \| `"flex-end"` \| `"stretch"` | ✅ | CSS `align-items` for children. |
| `style.justifyContent` | `"flex-start"` \| `"center"` \| `"flex-end"` \| `"space-between"` \| `"space-around"` | ✅ | CSS `justify-content` for children. |
| `children` | `string[]` | ✅ | Ordered IDs of child elements (CanvasElement, Container, Carousel, or Accordion). |
| `responsive` | object | ✅ | Breakpoint overrides — see table below. |

### GridCell responsive overrides

| Field | Type | Description |
|---|---|---|
| `columnSpan` | `number` | Override column span at this breakpoint. |
| `hidden` | `boolean` | Hide the cell at this breakpoint. |
| `layoutMode` | `"column"` \| `"row"` \| `"wrap"` | Override children stacking direction. |
| `minHeight` | `number` | Override minimum height. |
| `alignItems` | `string` | Override align-items. |
| `justifyContent` | `string` | Override justify-content. |
| `padding` | `Partial<Padding>` | Override any padding sides. |

---

## 8. CanvasElement Node

Leaf content nodes — text, images, buttons, etc. The `type` field determines which `content` fields are used.

```json
{
  "id":     "el-heading",
  "type":   "text",
  "parent": "cell-1",
  "layout": {
    "x": 0, "y": 0,
    "width": 600, "height": 80,
    "zIndex": 1, "rotation": 0
  },
  "style": { ... },
  "content": {
    "plain": "Welcome to Acme",
    "rich":  "<h1>Welcome to Acme</h1>"
  },
  "action": { "type": "none" },
  "interaction": { ... },
  "state": { "hidden": false, "locked": false },
  "responsive": { "mobile": { "style": { "typography": { "size": 24 } } } },
  "flexLayout": {
    "widthMode":  "fill",
    "widthValue": 0,
    "flexGrow":   1,
    "alignSelf":  "auto"
  },
  "overlayInCell": false,
  "cssPosition":   "relative"
}
```

### Element base fields

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | ✅ | Unique node identifier. |
| `type` | `ElementType` | ✅ | Element kind — one of `"text"` `"image"` `"button"` `"box"` `"divider"` `"video"` `"spacer"` `"icon"` `"form"`. |
| `parent` | `string` | ✅ | ID of the parent node (Section for free-mode; GridCell for grid/flex mode). |
| `layout` | object | ✅ | Position and size — see below. |
| `style` | object | ✅ | Visual style — see [ElementStyle](#elementstyle). |
| `content` | object | ✅ | Type-specific content — see [ElementContent](#elementcontent). |
| `action` | object | ❌ | Click / submit behavior — see [§14 Element Actions](#14-element-actions). |
| `interaction` | object | ✅ | **Deprecated** legacy click model. Kept for back-compat. If `action` is present, `action` takes priority. |
| `state.hidden` | `boolean` | ✅ | Hides the element in preview and export. |
| `state.locked` | `boolean` | ✅ | Prevents the element from being moved/resized in the editor. Does not affect export. |
| `responsive` | object | ✅ | Breakpoint overrides — see [§15](#15-responsive-overrides). |
| `flexLayout` | object | ✅ | Controls how this element sizes itself inside a flex/grid cell — see below. |
| `overlayInCell` | `boolean` | ❌ | When `true`, the element is absolutely positioned inside its cell instead of following the cell's flex flow. |
| `cssPosition` | `"relative"` \| `"absolute"` \| `"fixed"` \| `"sticky"` | ❌ | CSS `position` override. Default: `"relative"`. |

### `layout`

| Field | Type | Description |
|---|---|---|
| `x` | `number` | Left position in px. Only used in free-mode sections (absolute positioning). Ignored in grid/flex cells. |
| `y` | `number` | Top position in px. Only used in free-mode sections. |
| `width` | `number` | Element width in px. |
| `height` | `number` | Element height in px. |
| `zIndex` | `number` | CSS `z-index`. Higher = in front. |
| `rotation` | `number` | Rotation in degrees. `0` = no rotation. |

### `flexLayout`

Controls how the element sizes itself when inside a grid/flex cell.

| Field | Type | Description |
|---|---|---|
| `widthMode` | `"fill"` \| `"auto"` \| `"fixed"` \| `"percent"` | `"fill"` = expand to fill available space. `"auto"` = shrink to content. `"fixed"` = use `widthValue` px. `"percent"` = use `widthValue` %. |
| `widthValue` | `number` | Numeric value used when `widthMode` is `"fixed"` or `"percent"`. |
| `flexGrow` | `number` | CSS `flex-grow`. Usually `1` for `"fill"` mode, `0` otherwise. |
| `alignSelf` | `"auto"` \| `"flex-start"` \| `"center"` \| `"flex-end"` \| `"stretch"` | CSS `align-self` — overrides the cell's `alignItems` for this element only. |

### ElementStyle

| Field | Type | Required | Description |
|---|---|---|---|
| `opacity` | `number` | ✅ | CSS opacity `0`–`1`. |
| `background` | `ElementBackground` | ✅ | Element background — see [§12](#12-shared-style-objects). |
| `padding` | `Padding` | ✅ | Inner padding in px. |
| `margin` | `Partial<Padding>` | ❌ | Outer margin in px (partial — only set sides are stored). |
| `border` | `Border` | ✅ | Border — see [§12](#border). |
| `shadow` | `Shadow` | ✅ | Box shadow — see [§12](#shadow). |
| `typography` | `Typography` | ✅ | Text styling — see [§12](#typography). Applies to text and button elements. Stored on all element types for uniformity. |
| `hover` | object | ❌ | Hover state override for buttons — see below. |

### `style.hover`

| Field | Type | Description |
|---|---|---|
| `enabled` | `boolean` | Whether hover styles are active. |
| `backgroundColor` | `string` (hex) | Background color on hover. Omit to keep the element's normal background. |
| `textColor` | `string` (hex) | Text color on hover. Omit to keep normal. |
| `transitionDuration` | `number` | Transition speed in milliseconds. |

### ElementContent

All fields are optional. Which ones are used depends on `type`.

| Field | Used by | Type | Description |
|---|---|---|---|
| `plain` | `text` | `string` | Plain-text fallback content. |
| `rich` | `text` | `string` | HTML rich-text inner content (e.g. `<p>Hello <strong>world</strong></p>`). |
| `src` | `image` | `string` | Image URL. |
| `alt` | `image` | `string` | Image alt text for accessibility. |
| `objectFit` | `image` | `"cover"` \| `"contain"` \| `"fill"` | CSS `object-fit` for the image. |
| `objectPosition` | `image` | `string` | CSS `object-position`, e.g. `"center center"`. |
| `linkUrl` | `image` | `string` | If set, the image is wrapped in an `<a>` tag linking here. |
| `label` | `button` | `string` | Button text label. |
| `videoUrl` | `video` | `string` | YouTube, Vimeo, or direct video URL. |
| `thumbnailUrl` | `video` | `string` | Thumbnail image shown before the video plays. |
| `iconName` | `icon` | `string` | Icon identifier string. |
| `iconSize` | `icon` | `number` | Icon size in px. |
| `iconSvg` | `icon` | `string` | Raw SVG markup string. Takes priority over `iconName`. |
| `orientation` | `divider` | `"horizontal"` \| `"vertical"` | Direction of the divider line. |
| `formFields` | `form` | `FormField[]` | Array of form field definitions — see [§13](#13-form-fields). |
| `fieldGap` | `form` | `number` | Gap in px between form fields. |
| `submitLabel` | `form` | `string` | Label on the form's submit button. |

---

## 9. Container Node

A nested layout wrapper that lives inside a `GridCell`. It contains more `GridCell` nodes, allowing multi-level grid/flex layouts.

```json
{
  "id":         "container-1",
  "type":       "container",
  "parent":     "cell-1",
  "layoutMode": "grid",
  "gap":        16,
  "rowGap":     16,
  "children":   ["cell-inner-1", "cell-inner-2"],
  "responsive": {
    "tablet": { "layoutMode": "flex-col" },
    "mobile": { "layoutMode": "flex-col" }
  }
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | ✅ | Unique node identifier. |
| `type` | `"container"` | ✅ | Discriminator. |
| `parent` | `string` | ✅ | ID of the parent GridCell. |
| `layoutMode` | `"grid"` \| `"flex-col"` \| `"flex-row"` | ✅ | `"grid"` = 12-column CSS grid (column spans on child cells apply). `"flex-col"` = flex column stack (cells stack vertically). `"flex-row"` = flex row (cells grow equally side-by-side). |
| `gap` | `number` | ✅ | Gap between child cells in px. |
| `rowGap` | `number` | ✅ | Row gap in px (grid mode). |
| `children` | `string[]` | ✅ | Ordered GridCell IDs inside this container. |
| `responsive.tablet.layoutMode` | string | ❌ | Override layout mode at tablet breakpoint. |
| `responsive.mobile.layoutMode` | string | ❌ | Override layout mode at mobile breakpoint. |

---

## 10. Carousel Node

A slideshow component. Each slide is a `GridCell` node reusing all standard grid-cell functionality.

```json
{
  "id":       "carousel-1",
  "type":     "carousel",
  "parent":   "section-hero",
  "children": ["cell-slide1", "cell-slide2", "cell-slide3"],
  "props": {
    "autoplay":           false,
    "autoplayInterval":   5,
    "loop":               true,
    "showArrows":         true,
    "showDots":           true,
    "transitionDuration": 400,
    "pauseOnHover":       true,
    "dotColor":           "#ffffff"
  },
  "layout": {
    "x":         0,
    "y":         0,
    "width":     600,
    "height":    420,
    "zIndex":    1,
    "minHeight": 300
  },
  "responsive": {
    "tablet": { "width": 500, "height": 350 },
    "mobile": { "width": 375, "height": 280 }
  }
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | ✅ | Unique node identifier. |
| `type` | `"carousel"` | ✅ | Discriminator. |
| `parent` | `string` | ✅ | ID of the parent Section. |
| `children` | `string[]` | ✅ | Ordered GridCell IDs — one per slide. |
| `props.autoplay` | `boolean` | ✅ | Whether slides advance automatically. |
| `props.autoplayInterval` | `number` | ✅ | Seconds between auto-advances when `autoplay` is `true`. |
| `props.loop` | `boolean` | ✅ | Whether the carousel loops back to the first slide after the last. |
| `props.showArrows` | `boolean` | ✅ | Show previous/next arrow buttons. |
| `props.showDots` | `boolean` | ✅ | Show slide indicator dots. |
| `props.transitionDuration` | `number` | ❌ | Slide transition speed in ms. Default: `400`. |
| `props.pauseOnHover` | `boolean` | ❌ | Pause autoplay when the pointer is over the carousel. Default: `true`. |
| `props.dotColor` | `string` (hex) | ❌ | Color of the active dot indicator. Default: `"#ffffff"`. |
| `layout.x` | `number` | ✅ | Left position in px (free-section only). |
| `layout.y` | `number` | ✅ | Top position in px (free-section only). |
| `layout.width` | `number` | ✅ | Width of the carousel box in px. |
| `layout.height` | `number` | ✅ | Fixed height of the slide content area in px. |
| `layout.zIndex` | `number` | ❌ | CSS z-index. |
| `layout.minHeight` | `number` | ❌ | Minimum height in px. |
| `responsive` | object | ❌ | Per-breakpoint overrides for `x`, `y`, `width`, `height`, `minHeight`, `hidden`. |
| `activeSlide` | `number` | ❌ | **Editor-only.** Index of the currently shown slide. Do not persist — strip before saving. |

---

## 11. Accordion Node

A stacked collapsible component. Each item has a title, a chevron icon, and an expandable content area.

```json
{
  "id":     "accordion-1",
  "type":   "accordion",
  "parent": "cell-1",
  "children": [],
  "items": [
    {
      "id":            "item-1",
      "titleElId":     "el-title-1",
      "iconElId":      "el-icon-1",
      "contentCellId": "cell-content-1"
    }
  ],
  "props": {
    "allowMultiple":        false,
    "defaultOpen":          "first",
    "iconPosition":         "right",
    "expandedIconRotation": 180,
    "contentGap":           8,
    "itemGap":              8,
    "containerBorder":      true,
    "itemDivider":          true,
    "separatorColor":       "#e2e8f0",
    "separatorWidth":       1,
    "separatorStyle":       "solid",
    "borderRadius":         4
  },
  "layout": { "x": 0, "y": 0, "width": 520, "zIndex": 1 },
  "responsive": {
    "mobile": { "width": 340 }
  }
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | ✅ | Unique node identifier. |
| `type` | `"accordion"` | ✅ | Discriminator. |
| `parent` | `string` | ✅ | ID of the parent Section or GridCell. |
| `children` | `string[]` | ✅ | Always `[]` — not used at the accordion level. Items hold the real children. |
| `items` | `AccordionItem[]` | ✅ | Ordered list of collapsible rows — see below. |
| `props.allowMultiple` | `boolean` | ✅ | If `false`, opening one item closes all others. |
| `props.defaultOpen` | `"first"` \| `"all"` \| `"none"` | ✅ | Which items start expanded on the published page. |
| `props.iconPosition` | `"right"` \| `"left"` | ✅ | Which side of the title row the chevron icon sits. |
| `props.expandedIconRotation` | `number` | ❌ | Degrees to rotate the icon when an item is expanded. Default: `180`. |
| `props.contentGap` | `number` | ❌ | Gap in px between the title row and the content panel. |
| `props.itemGap` | `number` | ✅ | Gap in px between stacked accordion items. |
| `props.containerBorder` | `boolean` | ❌ | Draw a border around the whole accordion box. Default: `true`. |
| `props.itemDivider` | `boolean` | ❌ | Draw divider lines between items. Default: `true`. |
| `props.separatorColor` | `string` (hex) | ❌ | Color used for both the container border and item dividers. |
| `props.separatorWidth` | `number` | ❌ | Thickness in px used for both border and dividers. |
| `props.separatorStyle` | `"solid"` \| `"dashed"` \| `"dotted"` | ❌ | Line style used for both border and dividers. |
| `props.borderRadius` | `number` | ❌ | Corner radius in px for the outer container border box. |
| `layout.x` | `number` | ✅ | Left position in px. |
| `layout.y` | `number` | ✅ | Top position in px. |
| `layout.width` | `number` | ✅ | Width of the accordion box in px. |
| `layout.zIndex` | `number` | ❌ | CSS z-index. |
| `responsive` | object | ❌ | Per-breakpoint overrides for `x`, `y`, `width`, `hidden`. |
| `activeItems` | `string[]` | ❌ | **Editor-only.** IDs of currently expanded items. Do not persist — strip before saving. |

### AccordionItem

Each item references three nodes by ID. All three must exist in `nodes`.

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique item identifier. |
| `titleElId` | `string` | ID of a `"text"` CanvasElement — the editable heading text. |
| `iconElId` | `string` | ID of an `"icon"` CanvasElement — the chevron / expand icon. |
| `contentCellId` | `string` | ID of a `"grid-cell"` node — the droppable expandable content area. |

---

## 12. Shared Style Objects

### ElementBackground / SectionBackground

Used everywhere a background is needed. `SectionBackground` adds `overlay`.

```json
{
  "type":     "solid",
  "color":    "#ffffff",
  "image":    "",
  "position": "center center",
  "from":     "#ffffff",
  "to":       "#000000",
  "angle":    90,
  "overlay":  0
}
```

| Field | Type | Used when | Description |
|---|---|---|---|
| `type` | `"solid"` \| `"linear-gradient"` \| `"radial-gradient"` \| `"transparent"` | always | Which background mode is active. |
| `color` | `string` (hex) | `type: "solid"` | Solid fill color. |
| `image` | `string` | any | Background image URL. Empty string = no image. |
| `position` | `string` | `image` is set | CSS `background-position`, e.g. `"center center"` or `"top left"`. |
| `from` | `string` (hex) | gradient types | Gradient start color. |
| `to` | `string` (hex) | gradient types | Gradient end color. |
| `angle` | `number` | `"linear-gradient"` | Gradient angle in degrees (0 = top-to-bottom, 90 = left-to-right). |
| `overlay` | `number` | SectionBackground only | Dark overlay opacity `0`–`1` drawn on top of the background. `0` = no overlay. |

### Padding

```json
{ "top": 16, "right": 24, "bottom": 16, "left": 24 }
```

All values are in px. All four sides are always present.

### Border

```json
{ "radius": 8, "width": 1, "color": "#cccccc", "style": "solid" }
```

| Field | Type | Description |
|---|---|---|
| `radius` | `number` | Corner radius in px. `0` = no rounding. |
| `width` | `number` | Border thickness in px. `0` = no border. |
| `color` | `string` (hex) | Border color. |
| `style` | `"none"` \| `"solid"` \| `"dashed"` \| `"dotted"` | CSS `border-style`. Use `"none"` to disable. |

### Shadow

```json
{ "enabled": true, "x": 0, "y": 4, "blur": 12, "spread": 0, "color": "rgba(0,0,0,0.1)" }
```

| Field | Type | Description |
|---|---|---|
| `enabled` | `boolean` | Whether the shadow is rendered. |
| `x` | `number` | Horizontal offset in px. |
| `y` | `number` | Vertical offset in px. |
| `blur` | `number` | Blur radius in px. |
| `spread` | `number` | Spread radius in px. |
| `color` | `string` | Shadow color. Can be hex or `rgba(...)`. |

### Typography

```json
{
  "family":          "Inter, sans-serif",
  "size":            16,
  "weight":          "400",
  "color":           "#333333",
  "align":           "left",
  "lineHeight":      1.5,
  "letterSpacing":   0,
  "textTransform":   "none"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `family` | `string` | ✅ | CSS `font-family` stack. |
| `size` | `number` | ✅ | Font size in px. |
| `weight` | `string` | ✅ | CSS `font-weight`, e.g. `"400"`, `"700"`, `"bold"`. |
| `color` | `string` (hex) | ✅ | Text color. |
| `align` | `"left"` \| `"center"` \| `"right"` | ✅ | CSS `text-align`. |
| `lineHeight` | `number` | ✅ | CSS `line-height` (unitless multiplier, e.g. `1.5`). |
| `letterSpacing` | `number` | ❌ | CSS `letter-spacing` in em. `0` = normal. |
| `textTransform` | `"none"` \| `"uppercase"` \| `"lowercase"` \| `"capitalize"` | ❌ | CSS `text-transform`. Default: `"none"`. |

---

## 13. Form Fields

Defined on a `"form"` element in `content.formFields`. Each field represents one input in the rendered form.

```json
{
  "id":           "field-1",
  "type":         "email",
  "label":        "Email address",
  "name":         "email",
  "placeholder":  "you@example.com",
  "helpText":     "We'll never share your email.",
  "defaultValue": "",
  "required":     true,
  "width":        "full",
  "validation": {
    "preset":       "email",
    "minLength":    5,
    "maxLength":    100,
    "errorMessage": "Please enter a valid email."
  },
  "options": []
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | ✅ | Unique field identifier. |
| `type` | `string` | ✅ | Input type: `"text"` `"email"` `"number"` `"textarea"` `"select"` `"checkbox"` `"radio"` `"date"`. |
| `label` | `string` | ✅ | Visible label shown above the field. |
| `name` | `string` | ✅ | HTML `name` attribute — this is the key in the submitted payload. |
| `placeholder` | `string` | ❌ | Input placeholder text. |
| `helpText` | `string` | ❌ | Helper text shown below the field. |
| `defaultValue` | `string` | ❌ | Pre-filled value. |
| `required` | `boolean` | ✅ | Whether the field must be filled before submit. |
| `width` | `"full"` \| `"half"` | ✅ | Layout width: `"full"` spans the whole form row, `"half"` takes 50%. |
| `validation.preset` | `"none"` \| `"email"` \| `"url"` \| `"number"` | ❌ | Quick validation preset applied on top of other rules. |
| `validation.minLength` | `number` | ❌ | Minimum character length (text / textarea). |
| `validation.maxLength` | `number` | ❌ | Maximum character length. |
| `validation.min` | `number` \| `string` | ❌ | Minimum value — a number for `"number"` type, ISO date string for `"date"` type. |
| `validation.max` | `number` \| `string` | ❌ | Maximum value. |
| `validation.pattern` | `string` | ❌ | Raw regex source without slashes, e.g. `"^[A-Z]+"`. |
| `validation.errorMessage` | `string` | ❌ | Custom error message shown on validation failure. |
| `options` | `Array<{label, value}>` | ❌ | Choice options for `"select"`, `"radio"`, `"checkbox"` fields. |
| `rows` | `number` | ❌ | Number of visible rows for `"textarea"`. |

### Form submission payload

When submitted, the form sends a flat JSON object keyed by each field's `name`:

```json
{ "email": "jane@example.com", "message": "Hello!" }
```

---

## 14. Element Actions

An `action` on a CanvasElement defines what happens when clicked (button) or submitted (form).

```json
{
  "type":            "external-url",
  "url":             "https://example.com",
  "target":          "_blank",
  "pageId":          null,
  "email":           null,
  "subject":         null,
  "body":            null,
  "phone":           null,
  "popupId":         null,
  "targetSectionId": null,
  "smoothScroll":    true,
  "apiUrl":          null,
  "apiMethod":       "POST",
  "apiBody":         null
}
```

| `type` value | What it does | Relevant fields |
|---|---|---|
| `"none"` | No action | — |
| `"external-url"` | Opens a URL | `url`, `target` |
| `"internal-page"` | Navigates to another page in the site | `pageId` |
| `"send-email"` | Opens the user's email client | `email`, `subject`, `body` |
| `"make-call"` | Opens a phone dialer | `phone` |
| `"send-sms"` | Opens an SMS composer | `phone`, `body` |
| `"download-file"` | Downloads a file | `url` |
| `"open-popup"` | Shows a popup node | `popupId` |
| `"scroll-to-section"` | Smooth-scrolls to a section | `targetSectionId`, `smoothScroll` |
| `"scroll-to-top"` | Scrolls to top of page | `smoothScroll` |
| `"submit-form"` | Submits the form to an email address | `email` (recipient) |
| `"submit-api"` | POSTs form data to an API endpoint | `apiUrl`, `apiMethod`, `apiBody` |

### All action fields

| Field | Type | Description |
|---|---|---|
| `type` | `ActionType` | Which action to perform (see table above). |
| `url` | `string` | URL for `"external-url"` or `"download-file"`. |
| `target` | `"_self"` \| `"_blank"` | Link target for `"external-url"`. `"_blank"` opens in new tab. |
| `pageId` | `string` | Page ID for `"internal-page"`. |
| `email` | `string` | Recipient email for `"send-email"` and `"submit-form"`. |
| `subject` | `string` | Email subject for `"send-email"`. |
| `body` | `string` | Email body for `"send-email"` or SMS message for `"send-sms"`. |
| `phone` | `string` | Phone number for `"make-call"` and `"send-sms"`. |
| `popupId` | `string` | Node ID of the popup to show for `"open-popup"`. |
| `targetSectionId` | `string` | Section node ID to scroll to for `"scroll-to-section"`. |
| `smoothScroll` | `boolean` | Whether to use smooth scrolling. |
| `apiUrl` | `string` | Endpoint URL for `"submit-api"`. |
| `apiMethod` | `"POST"` \| `"PUT"` \| `"PATCH"` | HTTP method for `"submit-api"`. Default: `"POST"`. |
| `apiBody` | `string` | Static JSON body string for a button-only `"submit-api"` (not a form). |

---

## 15. Responsive Overrides

Desktop is the base. `responsive.tablet` and `responsive.mobile` store **only the fields that differ** from desktop — everything else inherits.

Breakpoints:
- **Tablet:** 768px
- **Mobile:** 375px

### CanvasElement responsive

```json
"responsive": {
  "tablet": {
    "layout":    { "width": 400, "height": 60 },
    "style":     { "typography": { "size": 18, "align": "center" } },
    "state":     { "hidden": false },
    "flexLayout":{ "widthMode": "fill" }
  },
  "mobile": {
    "state": { "hidden": true }
  }
}
```

| Override field | What it overrides |
|---|---|
| `layout` | Any of `x`, `y`, `width`, `height`, `zIndex`, `rotation` |
| `style.typography` | Any of `size`, `weight`, `align`, `letterSpacing`, `textTransform` |
| `state` | `hidden`, `locked` |
| `flexLayout` | Any of `widthMode`, `widthValue`, `flexGrow`, `alignSelf` |

### GridCell responsive

Overrides: `columnSpan`, `hidden`, `layoutMode`, `minHeight`, `alignItems`, `justifyContent`, `padding`.

### Section responsive

Overrides: `height`, `gap`, `rowGap`, `padding`, `hidden`.

### Carousel / Accordion responsive

Overrides: `x`, `y`, `width`, `height` (carousel only), `minHeight` (carousel only), `hidden`.

---

## 16. How the Tree Is Connected

```
BuilderState.pages[n].sections
  └─ Section.id  →  nodes["section-id"]
        │
        ├─ [layoutMode: "free"]
        │    └─ Section.children[]  →  nodes["el-id"]  (CanvasElement)
        │
        └─ [layoutMode: "grid" | "flex"]
             └─ Section.children[]  →  nodes["cell-id"]  (GridCell)
                   └─ GridCell.children[]
                         ├─ nodes["el-id"]       (CanvasElement)
                         ├─ nodes["carousel-id"] (Carousel)
                         │    └─ Carousel.children[]  →  nodes["cell-slide-id"]  (GridCell)
                         │         └─ GridCell.children[]  →  nodes["el-id"]  (CanvasElement)
                         ├─ nodes["accordion-id"] (Accordion)
                         │    └─ Accordion.items[n].titleElId    →  nodes["el-id"]  (CanvasElement)
                         │    └─ Accordion.items[n].iconElId     →  nodes["el-id"]  (CanvasElement)
                         │    └─ Accordion.items[n].contentCellId  →  nodes["cell-id"]  (GridCell)
                         └─ nodes["container-id"] (Container)
                              └─ Container.children[]  →  nodes["cell-id"]  (GridCell)
                                   └─ (same as GridCell above, recursion stops here)
```

**Key rules:**
- A `Section` with `layoutMode: "free"` → children are CanvasElement IDs
- A `Section` with `layoutMode: "grid"` or `"flex"` → children are GridCell IDs
- A `GridCell.children` can hold any mix of CanvasElement, Container, Carousel, Accordion IDs
- A `Container.children` holds only GridCell IDs
- A `Carousel.children` holds only GridCell IDs (one per slide)
- An `Accordion` item references exactly one text element, one icon element, and one GridCell via separate ID fields

---

## 17. Storage & Migration Rules

| Rule | Detail |
|---|---|
| **Store verbatim** | Accept the JSON as-is from the frontend. Return it as-is on load. |
| **No transformation** | Do not add, remove, or rename fields between save and load. |
| **Sparse format** | Default values are stripped before saving to keep JSON small. The frontend restores them on load. This is transparent — just store and return. |
| **Validate on save** | Run the incoming body against `builder-schema.json` (JSON Schema draft-07). Return `422` on failure. |
| **Migration is frontend-only** | If you receive a `"1.0"` document, return it unchanged. The frontend upgrades it to `"2.0"` on load, and the next save will write `"2.0"`. |
| **Editor-only fields** | `activeSlide` on Carousel and `activeItems` on Accordion are editor-only. The frontend strips them before saving, but if they appear in a document, ignore them — do not reject. |
| **`activePageId`** | Must match a valid `pages[].id`. Validate this on save. |
