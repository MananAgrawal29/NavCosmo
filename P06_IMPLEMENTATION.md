# P06 Implementation — Critical Review & Beam 1.0 Specification

**Product:** NavCosmo · NASA Space Apps Challenge 2026  
**Direction:** Lunar Instrument — an editorial scientific instrument wrapped around a full-bleed Moon.  
**Purpose:** Correct the P06 blueprint against the actual repository, then define a 60-minute Beam 1.0 that is visually meaningful and regression-safe.

---

## 0. Verdict

The blueprint’s visual direction is right. Several of its implementation decisions are not.

The actual application already has a working full-bleed workspace, a deliberate `viewportMode` deferred-mount workaround, URL-driven site/mode state, camera focus-on-selection, a sunlight timer gated to Sunlight mode, and a two-site comparison table. Beam 1.0 should **not** rebuild that shell. It should replace the visual language around it.

**Beam 1.0 thesis:** change the instrument, not the machine.

The highest-impact, lowest-risk work is:

1. Replace the palette, type hierarchy and card shape globally.
2. Recompose the workspace chrome, site rail and inspector inside `WorkspacePage`.
3. Restyle the shared viewer HUDs and timeline without touching camera, terrain, simulation or URL logic.
4. Apply a small shell polish pass only if the workspace is finished.

Do **not** remove the sidebar, move the mode switch into the global header, float the timeline over the canvas, or rebuild Compare as a 2×2 grid in this pass.

---

## 1. Critical design decisions

### 1.1 Where the blueprint is too rigid

| Blueprint rule | Problem | Beam 1.0 decision |
|---|---|---|
| “Zero shadows” everywhere | Flat opaque panels over a bright lunar limb can lose separation and read as sterile. | No card shadows. Allow **one** low-opacity shadow on the two floating workspace panels. |
| “Zero uppercase labels” everywhere | NASA mission-control information benefits from a small number of compact telemetry labels. Banning every capital removes instrument character. | No uppercase eyebrow/kicker labels. Permit uppercase **only** for 2–3 telemetry labels in the timeline/inspector, at 11–12px with normal tracking. |
| “Only selected marker gets a label” | With exactly two sites, persistent labels aid discovery and orientation. | Keep both labels. Make them quieter, flatter and easier to hit. |
| “65% free viewport” | Hard to verify and encourages undersized panels. | Replace with concrete dimensions: left rail 272px, inspector 320px, 12px insets, both collapsible. |
| “Move mode switch to the global header” | Requires a shell refactor and detaches the mode from the viewport. | Keep the workspace utility bar. Slim it to 44px and use underline tabs. |
| “Floating 720px timeline” | It would cover terrain and change canvas height unpredictably. | Keep the timeline as a dock below the canvas. Restyle it to 64px. |
| “2×2 Compare” | Factually wrong: there are two candidate sites and an existing comparison table. | Keep the two-column comparison, restyle it as an editorial analysis sheet. |
| Google Fonts request | Adds a runtime network dependency and font-swap shift to a no-dependency pass. | Use a system editorial stack in Beam 1.0. Self-host or load a display face in P06.1. |

### 1.2 Premium, not sterile

The interface should not become an all-charcoal grid with cyan outlines. Its richness comes from:

- A warm regolith-white ink (`#ECE9E2`) against cold charcoal, not pure white on pure black.
- A system editorial serif for the selected site name and page titles only.
- One honest lunar image as the dominant texture.
- A single subtle panel shadow to separate chrome from the Moon.
- Solar amber reserved for the sun; warning terracotta reserved for caveats.
- A 3px cyan selection bar and circular camera controls as the memorable instrument details.
- Persistent technical annotations — coordinates, tabular values, attribution — that look measured rather than decorative.

No gradients, glows, icon tiles, fake crosshairs, or ornamental HUD rings.

### 1.3 Components that must stay visually distinct

| Component | Why it is distinct | Treatment |
|---|---|---|
| Site rail | An index, not a card stack | Flat rows, 3px selected bar, 12px coordinates, no nested card |
| Inspector | A contextual briefing | Serif site name, definition-list metrics, caveat at the bottom |
| Terrain mode switch | A spatial tool attached to the terrain | Compact, in-canvas, 2px radius, active fill |
| Sun HUD | Spatial direction, not a metric card | Small azimuth/elevation readout, solar amber |
| Timeline | A temporal instrument | Play control, tabular time, slider, speed; not a generic card |
| Caveat | A data-integrity warning | 3px warning bar or 1px warning rule, 12px, always visible |
| Marker label | A spatial annotation | Flat dark scrim, 12px, 44px hit area, no blur or shadow |
| Compare board | An editorial analysis sheet | Two columns and a table, not a spatial 2×2 grid |

All components share tokens. They should **not** share the same container shape, padding, or visual weight.

---

## 2. Google Earth interaction review

### Keep what already works

- `MoonViewer` already focuses the camera when `selectedSiteId` changes, via `CameraRig`/`focusSite`. This is the global-to-local transition. Do not rewrite it.
- Site selection is URL-driven. Preserve `?site=` and `?mode=` exactly.
- OrbitControls already provides drag/touch rotation, damping, scroll zoom, and distance limits.
- The selected marker ring and camera focus provide continuity. Preserve both.

### Safe improvements in Beam 1.0

1. **Auto-open the inspector on site selection.** In `WorkspacePage.setSite`, also set `rightOpen(true)`. On narrow screens this already closes the left panel. This is state-only and makes contextual discovery work like a place card.
2. **Keep both marker labels.** Increase the label button to a 44px hit area on touch, 12px type, flat scrim, 2px radius. Remove backdrop blur and shadow.
3. **Move panels closer to the canvas edge.** Change `top-16` to `top-3`, use 12px insets, and keep both panels collapsible. This recovers vertical space currently wasted inside the canvas.
4. **Keep camera controls top-right in Beam 1.0.** Moving them to bottom-right changes a shared component used by Explorer and Overview and risks colliding with attribution. A workspace-only placement prop belongs in P06.1.
5. **Preserve the deferred canvas swap.** Do not wrap `MoonViewer`, `TerrainViewer`, or their conditional blocks in animation/layout wrappers. The 60–80ms unmount window is deliberate.
6. **Mobile:** keep the current overlay-panel model. Make mode tabs horizontally scrollable, panel toggles 44px, and inspector width `min(20rem, calc(100% - 1.5rem))`. Do not build a bottom sheet in Beam 1.0.

### Deferred

- Camera fly-to between global and terrain modes.
- A workspace-only camera-control placement.
- Bottom-sheet inspector.
- Compare as a spatial split view.
- Any new navigation/tour/onboarding.

---

## 3. Architecture and regression audit

### 3.1 Safe changes

| Area | Safe work |
|---|---|
| `src/index.css` | Change token values, add display/ink/solar/warning/faint/raised tokens, base focus/selection styles. Keep all existing token names. |
| `Card.tsx` | Flatten radius, remove shadow, change type. Used globally; intentional visual change, no API change. |
| `WorkspacePage.tsx` | Class names, panel dimensions, utility-bar markup, inspector markup, removing the duplicate terrain-mode section, `setRightOpen(true)` on selection, `aria-pressed`/`aria-label`, `dvh` height. |
| `MoonViewer.tsx` | HUD/control/button/label classes, hit areas, remove the redundant “Interactive lunar globe” badge. Do not touch `CameraRig`, camera constants, marker positions or OrbitControls. |
| `TerrainViewer.tsx` | Mode switch, sun HUD, reset button, caption and warning classes. Do not touch geometry, lighting, shadows, `ViewportSync` or `TerrainMesh`. |
| `SimulationTimeline.tsx` | Markup/classes, 44px controls, 12px labels, tabular figures, token accent. Do not change props or hook calls. |
| `Layout.tsx` / `Sidebar.tsx` | Visual classes only: opaque header, remove “Desktop-first preview”, remove stale “P04” card copy, active nav bar. No height or width change in Beam 1.0. |
| `SiteCard.tsx` | Visual classes only, if time. |

### 3.2 Risky changes

| Change | Risk |
|---|---|
| Removing the sidebar, `md:pl-64`, or changing the 64px header | Breaks workspace height calculations (`calc(100vh - 4rem)`), mobile navigation, and every secondary-page layout. Defer. |
| Moving mode switch into `Layout` | Couples a workspace concern to the global shell and risks route layout changes. Defer. |
| Floating the timeline inside the canvas | Changes canvas height, obscures terrain, and complicates panel placement. Defer. |
| Wrapping conditional canvases in animation/transition components | Can remount the R3F canvas, lose WebGL context, or defeat the deferred mount. Do not. |
| Changing `useSunlightSimulation` or its `active` argument | Can break timer gating. Do not touch. |
| Changing `viewportMode` effect timing | Can produce two canvases or blank frames. Do not touch. |
| Renaming `site`/`mode` params or restructuring `updateParams` | Breaks deep links and back/forward. Do not touch. |
| Rebuilding Compare as 2×2 | Invents a third/fourth cell and discards the actual two-site table. Do not. |
| Removing all marker labels | Harms discovery with only two sites. Do not. |
| External Google Fonts | Adds runtime dependency and layout shift. Defer. |

### 3.3 Exact invariants

These files must not change in Beam 1.0:

- `src/hooks/useSunlightSimulation.ts`
- `src/data/lunarSites.ts`
- `src/data/siteProfiles.ts`
- `src/utils/terrainModel.ts`
- `src/utils/lunarCoordinates.ts`
- `src/App.tsx`
- `package.json` and `package-lock.json`

Preserve:

- One active R3F `<Canvas>`.
- `?site=&mode=` synchronisation with `replace: true`.
- `viewportMode` deferred mount.
- Sunlight timer only active when `mode === 'sunlight'`.
- Moon camera focus on selection and marker click.
- Compare data from `siteProfiles`.
- NASA attribution and all caveat meanings.

---

## 4. Revised component layout

### 4.1 Workspace

```
Global header (64px, keep)
├─ Sidebar (256px, keep in Beam 1.0)
└─ Workspace
   ├─ Utility bar (44px)
   │  ├─ left panel toggle (44px)
   │  ├─ mode tabs: Moon / Terrain / Sunlight / Compare (underline, not pills)
   │  └─ right panel toggle (44px)
   ├─ Canvas area (remaining height)
   │  ├─ MoonViewer or TerrainViewer or ComparisonBoard
   │  ├─ Site rail (272px, left 12, top 12, bottom 12)
   │  └─ Inspector (320px, right 12, top 12, bottom 12)
   ├─ Attribution/caveat inside viewer HUD
   └─ Sunlight timeline dock (64px, only Sunlight)
```

- The utility bar remains outside the canvas, so it does not obscure the Moon.
- The site rail and inspector are opaque panels with 2px radius, one 1px line and one subtle shadow.
- The inspector opens on site selection and can be closed with a 44px control.
- Mobile: both panels overlay; mode tabs scroll horizontally; no bottom sheet in this pass.

### 4.2 Global Moon

- One full-width `MoonViewer`.
- Site rail left, inspector right.
- Both marker labels visible.
- Top-right zoom/reset controls enlarged to 44px, circular, opaque.
- Remove the redundant “Interactive lunar globe” badge. Keep one caption plus NASA attribution.
- Site name in the inspector is the largest text in the workspace.

### 4.3 Terrain and Sunlight

- `TerrainViewer` keeps its own terrain-mode switch. Remove the duplicate “Terrain display” control block from the workspace site rail.
- Sun HUD remains spatial and compact. Inspector carries the detailed numbers.
- Sunlight timeline stays below the canvas.
- Persistent terrain caveat: illustrative, not a DEM.
- Persistent solar caveat: illustrative relative availability, not power.
- Solar amber appears only in Sunlight mode and sun readouts.

### 4.4 Compare

- Keep the existing two-site comparison data and table.
- Remove the two rounded cards around the site summaries; use two editorial columns with a top rule.
- Keep the table; make it flat with 1px row rules.
- Keep the caveat that statuses are qualitative, not measured scores.
- Do not invent a 2×2 image grid or additional sites.

### 4.5 Timeline

- Keep it below the canvas.
- 64px visual height; wrap allowed at narrow widths.
- 44px play and reset controls.
- Time in 18–20px tabular sans, not mono.
- Speed options as compact 36/44px text buttons.
- Slider uses `accent-color: var(--color-accent)`.
- Labels 12px, sentence case. No uppercase micro-labels.
- Preserve all props and behavior.

---

## 5. Updated design tokens

Keep every existing token name so current classes continue to compile. Add new semantic tokens only where needed.

```css
@theme {
  /* Existing names, new values */
  --color-space: #06090D;
  --color-panel: #0D141A;
  --color-card: #141D24;
  --color-accent: #7DD3E0;
  --color-accent2: #A7BEC9;   /* demoted secondary data tone, not a second accent */
  --color-text: #ECE9E2;
  --color-muted: #9AA4AD;
  --color-border: #2A343E;

  /* Additions */
  --color-raised: #1B252D;
  --color-faint: #8B96A0;
  --color-solar: #E3B56A;
  --color-warning: #D48B78;

  --font-sans: "Inter", "Segoe UI Variable", "Segoe UI", system-ui, sans-serif;
  --font-display: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif;

  --radius-instrument: 2px;
  --shadow-panel: 0 16px 40px rgb(0 0 0 / 0.28);
}
```

Base additions in `src/index.css`:

```css
:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

::selection {
  background: var(--color-accent);
  color: var(--color-space);
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Rules:

- `--color-accent` only for active mode, selection, focus, primary action.
- `--color-accent2` is data/region text only; replace decorative teal uses where practical.
- `--color-solar` only for sunlight values and sun indicator.
- `--color-warning` only for caveats.
- No new color tokens beyond this list.
- No external font request in Beam 1.0. The display stack is local; P06.1 can self-host a face.
- Replace `font-mono` with `tabular-nums` in workspace readouts. Do not add a mono family.
- Panels may use `shadow-[var(--shadow-panel)]`; cards may not.

---

## 6. Exact files to modify

### Must implement

| File | Change |
|---|---|
| `src/index.css` | Tokens, base ink/background, focus, selection, reduced motion. |
| `src/components/common/Card.tsx` | 2px radius, 1px line, no shadow, tighter type; update `StatCard`/`SectionHeader` labels to sentence case. |
| `src/pages/WorkspacePage.tsx` | Utility bar underline tabs, 44px toggles, panel dimensions/insets, site rail rows, inspector hierarchy, remove duplicate terrain control, auto-open inspector, `aria` fixes, `dvh`, remove `font-mono`/9–10px labels. |
| `src/components/common/MoonViewer.tsx` | 44px camera controls, flat marker labels, remove redundant badge, 12px caption, no blur/shadow on labels, token colors. Do not touch camera logic. |
| `src/components/common/TerrainViewer.tsx` | 2px mode switch, 44px reset, 12px sun HUD/caption, warning token, remove blur. Do not touch geometry/lighting. |
| `src/components/workspace/SimulationTimeline.tsx` | 44px controls, 12px labels, tabular time, token accent, flat speed buttons. Keep props. |

### Implement if time permits

| File | Change |
|---|---|
| `src/components/layout/Layout.tsx` | Opaque header, remove “Desktop-first preview” badge, visual polish only. |
| `src/components/layout/Sidebar.tsx` | Active nav bar, flat nav surfaces, remove stale “P04” copy. No width/height change. |
| `src/components/common/SiteCard.tsx` | Remove nested card and “Candidate” pill; selected left bar. |
| `src/pages/DataSourcesPage.tsx` | Editorial heading, remove card grid if time. Keep all copy/links. |
| `src/pages/AboutPage.tsx` | Editorial heading and flat sections if time. Keep all copy/links. |

### Defer to P06.1

- `src/App.tsx` route changes.
- Global shell restructure, sidebar removal, 48px header.
- Floating timeline, bottom sheet, camera fly-to.
- Compare 2×2, additional comparison sites.
- Full Analysis/Simulator/Explorer/Overview/Comparison page redesigns.
- Google Fonts or self-hosted font files.
- Any scientific, data, terrain or simulation change.

---

## 7. 60-minute implementation sequence

### Stage 0 — Baseline · 2 min

- Run `npm run build` and `npm run lint`.
- Open `/workspace?site=shackleton-crater&mode=global`.
- Confirm one canvas and no console errors.
- **Do not proceed** if the baseline build is already broken.

### Stage 1 — Tokens and global surface · 8 min

- **Files:** `src/index.css`, `src/components/common/Card.tsx`.
- Set new token values; add display/ink/solar/warning/raised/faint.
- Set base background, text, focus, selection, reduced motion.
- Flatten `Card`: `rounded-[2px]`, 1px border, no shadow, `p-4`.
- Change card labels from uppercase to 12px sentence case.
- **Check:** build; all pages still render; no missing token classes.

### Stage 2 — Workspace chrome, rail and inspector · 15 min

- **File:** `src/pages/WorkspacePage.tsx`.
- Utility bar: 44px, mode buttons with underline active state, no pill container, 44px panel toggles, `aria-label` on all icon-only buttons, `aria-pressed` on modes.
- Site rail: 272px, `top-3 left-3 bottom-3`, opaque, 2px radius, one panel shadow, 12px coordinates, 3px selected bar, no nested cards.
- Inspector: 320px, `top-3 right-3 bottom-3`, serif 28px site name, 12px region, definition-list metrics, 12px caveat with warning rule, 44px close.
- Remove the duplicate “Terrain display” block; terrain modes remain in `TerrainViewer`.
- `setSite` also opens the inspector.
- Use `100dvh` for the workspace height.
- Replace `font-mono` with `tabular-nums`; replace 9–10px text with 12px.
- **Check:** all four modes; deep link; marker/list sync; one canvas; close/reopen panels.

### Stage 3 — Shared viewer HUDs · 12 min

- **Files:** `MoonViewer.tsx`, `TerrainViewer.tsx`.
- Zoom/reset buttons: 44px, circular, opaque, token colors.
- Marker labels: 12px, 2px radius, flat `bg-space/85`, no blur/shadow, 44px touch target.
- Remove the MoonViewer “Interactive lunar globe” badge.
- Terrain mode switch: 2px radius, 44px height, active accent fill; reset 44px.
- Sun HUD: 12px, solar token, no rounded pill/blur.
- Captions and warnings: 12px, warning token, no dashed rounded box.
- If cheap: respect reduced motion in the marker pulse via `matchMedia`.
- **Do not touch** `CameraRig`, camera constants, marker positions, `TerrainMesh`, `ViewportSync`, lighting or shadows.
- **Check:** mode cycle 3×; no WebGL context errors; camera focus still works; terrain still renders.

### Stage 4 — Timeline · 8 min

- **File:** `SimulationTimeline.tsx`.
- Play/reset 44px; speed 36/44px.
- 12px labels, tabular time, token accent on slider.
- Remove uppercase micro-labels and `font-mono`.
- Keep the component props unchanged.
- **Check:** play/pause, speed, scrub, reset; timer stops when leaving Sunlight.

### Stage 5 — Shell polish · 6 min, if time

- **Files:** `Layout.tsx`, `Sidebar.tsx`.
- Opaque header, no backdrop blur.
- Remove “Desktop-first preview”.
- Replace stale “P04 unified workspace” copy with “P06 · Lunar Instrument” or remove the card.
- Active nav: 3px left accent bar, no rounded pill.
- **Do not change** header height, sidebar width, `md:pl-64`, routes or menu behavior.
- **Check:** all routes; mobile drawer; workspace height unchanged.

### Stage 6 — Secondary quick pass · 5 min, if time

- **Files:** `SiteCard.tsx`, `DataSourcesPage.tsx`, `AboutPage.tsx`.
- Remove nested card/pill from `SiteCard`.
- Replace eyebrow labels with sentence-case headings.
- Flatten Data/About cards if time; preserve all copy, links and source order.
- **Check:** 390px and 1440px; no horizontal overflow.

### Stage 7 — Verification · 4 min

- `npm run build`; `npm run lint`.
- Test `/workspace?site=malapert-massif&mode=sunlight` directly.
- Cycle all modes; select both sites; open/close both panels.
- Play/pause; switch away from Sunlight; confirm timer paused.
- Check 320, 390, 768, 1024, 1440.
- Confirm no package.json/lock changes and no changes to protected files.

---

## 8. Risks and regression safeguards

| Risk | Safeguard |
|---|---|
| Canvas remount / context loss | Keep the exact conditional structure around `MoonViewer`/`TerrainViewer`. Do not wrap them in new animation or layout components. |
| `viewportMode` race | Do not edit the effect or its 60/80ms timers. |
| Deep-link breakage | Do not rename `site`/`mode`; keep `setSearchParams(next, { replace: true })`. |
| Timer gating regression | Do not modify `useSunlightSimulation` or the `mode === 'sunlight'` argument. |
| Compare data loss | Keep `ComparisonBoard` data, `lunarSites` destructuring and the table. Restyle only. |
| Terrain mode disappears | `TerrainViewer` keeps its own switch; remove only the duplicate block in the left rail. |
| Camera regression | Do not edit `CameraRig`, `focusSite`, `INITIAL_CAMERA`, `MIN_DISTANCE` or `MAX_DISTANCE`. |
| Shared viewer side effects | `MoonViewer` is used by Workspace, Explorer and Overview; `TerrainViewer` by Workspace, Analysis and Simulator. Keep prop APIs stable. |
| Token class breakage | Keep all existing `--color-*` names; add new tokens rather than renaming. |
| Status semantics | `accent2` is demoted to a cool data tone; statuses still carry text labels, not color alone. |
| Panel obstruction | 12px insets, max 272/320px, both collapsible; no panel wider than 25% of a 1440px viewport. |
| Pointer/touch conflict | Keep panels scrollable with `overscroll-contain`; verify orbit controls in the gap around panels. |
| Mobile overflow | Mode tabs scroll horizontally; speed controls wrap; inspector `min(20rem, calc(100% - 1.5rem))`; no fixed-width table in workspace. |
| Text contrast | Use `--color-faint` only for nonessential 11px attribution; functional labels use `--color-muted`. Verify 4.5:1. |
| Scope creep | Stop after Stage 4 if time is short. The workspace is the product; shell and secondary pages are optional. |

---

## 9. Acceptance criteria

### Functional

- [ ] All four workspace modes switch correctly.
- [ ] `?site=` and `?mode=` restore on reload, back and forward.
- [ ] Selecting a site updates marker, rail and inspector; the inspector opens.
- [ ] Camera focus on selection still works.
- [ ] Compare still shows two sites and the qualitative table.
- [ ] Sunlight play/pause, speed, scrub and reset work.
- [ ] Timer runs only in Sunlight mode.
- [ ] One active WebGL canvas; no context-loss errors after cycling modes 3×.
- [ ] All routes and navigation links work.
- [ ] NASA attribution and all caveats are visible.

### Visual

- [ ] No `rounded-2xl`/`rounded-xl` in the workspace, viewer chrome or timeline.
- [ ] Rectangular surfaces use 2px radius; only camera controls are circular.
- [ ] No backdrop blur on workspace panels or labels.
- [ ] At most one panel shadow; no card shadows.
- [ ] No gradient, glow or decorative dotted border in the workspace.
- [ ] No text below 11px; workspace functional text is 12px or larger.
- [ ] Selected site name is the largest text in the inspector.
- [ ] Accent is limited to active mode, selection, focus and primary action.
- [ ] Solar amber appears only in Sunlight; warning terracotta only on caveats.
- [ ] Site rail and inspector read as different instruments, not the same card twice.
- [ ] Compare reads as an editorial table, not a 2×2 image grid.

### Accessibility and responsive

- [ ] Every icon-only control has `aria-label`; mode buttons expose `aria-pressed`.
- [ ] All workspace controls are at least 44px on touch, 36–44px on desktop.
- [ ] Visible 2px focus ring on all interactive elements.
- [ ] No horizontal overflow at 320, 390, 768, 1024 or 1440.
- [ ] Panels remain operable at 390px; close/reopen controls are reachable.
- [ ] Reduced-motion CSS removes nonessential transitions.
- [ ] Caveats are readable without opening a menu.

### Delivery

- [ ] `npm run build` passes.
- [ ] `npm run lint` passes.
- [ ] No changes to `package.json` or `package-lock.json`.
- [ ] No changes to scientific logic, coordinates, caveat meaning, terrain generation or solar math.
- [ ] No new routes, features, dependencies or data sources.
- [ ] Only the files listed in section 6 are modified.

---

## 10. Explicitly out of scope for Beam 1.0

- Removing the sidebar or changing the global header height.
- Moving the mode switch into `Layout`.
- Floating the timeline over the 3D viewport.
- Rebuilding Compare as a 2×2 spatial grid.
- Adding a bottom-sheet inspector.
- Adding camera fly-to or new OrbitControls behavior.
- Adding Google Fonts or font files.
- Redesigning Analysis, Simulator, Explorer, Overview or the `/comparison` route.
- Adding charts, filters, search, tours, onboarding, sound or new data.
- Changing `useSunlightSimulation`, `terrainModel`, `lunarSites`, `siteProfiles`, `lunarCoordinates` or `App.tsx`.
- Any scientific claim beyond the existing caveats.
