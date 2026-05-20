---
name: HappyCoin
colors:
  surface: '#fff8f2'
  surface-dim: '#e3d9c9'
  surface-bright: '#fff8f2'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fef2e2'
  surface-container: '#f8ecdc'
  surface-container-high: '#f2e7d7'
  surface-container-highest: '#ece1d1'
  on-surface: '#201b11'
  on-surface-variant: '#4f4633'
  inverse-surface: '#353025'
  inverse-on-surface: '#fbefdf'
  outline: '#817661'
  outline-variant: '#d3c5ad'
  surface-tint: '#795900'
  primary: '#795900'
  on-primary: '#ffffff'
  primary-container: '#f4b91f'
  on-primary-container: '#674b00'
  inverse-primary: '#f9bd24'
  secondary: '#735b24'
  on-secondary: '#ffffff'
  secondary-container: '#fedb98'
  on-secondary-container: '#785f28'
  tertiary: '#006783'
  on-tertiary: '#ffffff'
  tertiary-container: '#4cd0ff'
  on-tertiary-container: '#00576f'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdf9f'
  primary-fixed-dim: '#f9bd24'
  on-primary-fixed: '#261a00'
  on-primary-fixed-variant: '#5c4300'
  secondary-fixed: '#ffdf9f'
  secondary-fixed-dim: '#e3c281'
  on-secondary-fixed: '#261a00'
  on-secondary-fixed-variant: '#59430e'
  tertiary-fixed: '#bce9ff'
  tertiary-fixed-dim: '#62d4ff'
  on-tertiary-fixed: '#001f29'
  on-tertiary-fixed-variant: '#004d63'
  background: '#fff8f2'
  on-background: '#201b11'
  surface-variant: '#ece1d1'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '900'
    lineHeight: 56px
    letterSpacing: -0.04em
  display-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 36px
    fontWeight: '900'
    lineHeight: 42px
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '800'
    lineHeight: 32px
    letterSpacing: -0.02em
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  xxl: 64px
  container-max: 1200px
  gutter: 24px
  margin-mobile: 16px
---

## Brand & Style

The brand identity is built on the concept of "Earned Joy"—positioning student rewards as both a prestigious achievement and a playful daily utility. The design system adopts a **Modern Corporate** aesthetic, drawing inspiration from high-end developer tools and fintech platforms to provide students with a sense of financial maturity while maintaining a warm, approachable energy.

The UI evokes a feeling of polished reliability through generous whitespace, high-contrast typography, and a "surgical" application of its signature golden yellow. Every interaction should feel intentional, using tactile depth and subtle motion to reinforce the value of the digital currency.

**Key Stylistic Pillars:**
- **Refined Precision:** Clean layouts with strict alignment and purposeful negative space.
- **Warm Professionalism:** A palette that swaps clinical grays for soft, creamy neutrals to keep the experience inviting.
- **High-Impact Hierarchy:** Massive, heavy-weight headings contrasted against light-weight body text.

## Colors

The color palette is centered around "The Glow"—a vibrant golden yellow used exclusively for moments of value, action, and celebration. 

- **Primary & Primary Strong:** Used for main call-to-actions, currency balances, and success states. These are the focal points of the interface.
- **Surface & Background:** The application uses a pure white background for primary content areas, while the warm cream (`#faf8f0`) is used for secondary containers and background sections to provide a soft contrast.
- **Ink & Muted:** Text hierarchy is established through a deep black for headings and a desaturated warm gray for supporting information.
- **Interactive States:** Focus states must utilize the specific soft golden ring (`rgba(244,185,31,0.14)`) to ensure accessibility without breaking the minimalist aesthetic.

## Typography

This design system utilizes **Hanken Grotesk** for its clean, contemporary grotesk qualities that scale beautifully from ultra-heavy displays to legible body copy. 

**Headlines:** Headings should be set with tight letter-spacing and maximum weights (800-900). This creates a "Fintech" look that feels authoritative and modern.
**Body:** Body text uses standard weights with generous line height to ensure readability during long browsing sessions.
**Labels:** **JetBrains Mono** is used for utility-based text like currency codes, dates, and micro-labels to provide a technical, "ledger-like" feel that reinforces the app's currency theme.

## Layout & Spacing

The layout philosophy follows a **strict 4px grid system** with a preference for "Airy" compositions.

- **Desktop:** 12-column fluid grid with a maximum container width of 1200px. Gutters are fixed at 24px to maintain a high-end, spacious feel.
- **Mobile:** Single column with 16px side margins.
- **Vertical Rhythm:** Use larger increments (`xl`, `xxl`) between major sections to emphasize the minimalist aesthetic. Use smaller increments (`xs`, `sm`) for grouping related elements like labels and inputs.
- **Alignment:** All content should be left-aligned by default to maintain the clean, "Linear-style" structural integrity.

## Elevation & Depth

Hierarchy is established through "Layered Flatness"—avoiding heavy dropshadows in favor of subtle, ambient depth.

- **Cards:** Use a multi-layered shadow approach. A very soft, large-radius shadow (Blur: 20px, Opacity: 4%, Color: Ink) combined with a 1px solid border (`#eadfca`).
- **Surface Tiering:** 
  - **Level 0 (Background):** White or Warm Cream.
  - **Level 1 (Cards/Containers):** Pure White with border and subtle shadow.
  - **Level 2 (Modals/Popovers):** Pure White with a slightly more pronounced shadow (Blur: 40px, Opacity: 8%) to indicate higher interaction priority.
- **Active States:** Buttons and interactive cards should appear to "sink" slightly on press (reduce shadow and translate Y by 1px) to provide tactile feedback.

## Shapes

The shape language is a mix of geometric structure and organic softness.

- **Structural Elements:** Cards and input fields use a consistent **16px (rounded-xl)** radius. This provides a modern, friendly container for content.
- **Interactive Elements:** Primary and secondary buttons are **fully pill-shaped (9999px)**. This distinction helps users instantly identify clickable actions versus static content.
- **Small Components:** Chips, tags, and small alerts use a **8px (rounded-lg)** radius to remain distinct from the larger card containers.

## Components

**Buttons:**
- **Primary:** Pill-shaped, Background: Golden Yellow (`#f4b91f`), Text: Ink (`#111111`). Strong, bold font-weight.
- **Secondary:** Pill-shaped, Background: White, Border: 1px `#eadfca`, Text: Ink.
- **Tertiary:** Text-only with an underline on hover.

**Cards:**
- White background, 16px corner radius, 1px `#eadfca` border. Use for reward items, student profiles, and transaction history.
- Padding should be generous (24px or 32px) to maintain the clean aesthetic.

**Input Fields:**
- 16px radius, Background: White, Border: 1px `#eadfca`. 
- Focus state: Border changes to `#d99a00` with the specific primary focus ring.

**Chips / Rewards:**
- Used for coin denominations. Should use the `label-sm` (JetBrains Mono) font and always include a small coin icon in the primary golden yellow.

**Progress Bars:**
- Track: `#faf8f0`. Fill: `#f4b91f`. Used for tracking "Goal to next Reward" milestones.

**Lists:**
- Transactions and activity feeds should use simple dividers (`1px #eadfca`) with ample vertical padding (16px) between items. Avoid boxing every list item; let the whitespace define the rows.