---
name: Assurance Flux
colors:
  surface: '#f4fafe'
  surface-dim: '#d5dbdf'
  surface-bright: '#f4fafe'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4f8'
  surface-container: '#e9eff3'
  surface-container-high: '#e3e9ed'
  surface-container-highest: '#dde3e7'
  on-surface: '#161c1f'
  on-surface-variant: '#564241'
  inverse-surface: '#2b3135'
  inverse-on-surface: '#ecf2f6'
  outline: '#897171'
  outline-variant: '#dcc0bf'
  surface-tint: '#a13c40'
  primary: '#771d23'
  on-primary: '#ffffff'
  primary-container: '#963438'
  on-primary-container: '#ffbab8'
  inverse-primary: '#ffb3b1'
  secondary: '#b12b33'
  on-secondary: '#ffffff'
  secondary-container: '#ff6567'
  on-secondary-container: '#690010'
  tertiary: '#735c00'
  on-tertiary: '#ffffff'
  tertiary-container: '#c6a94d'
  on-tertiary-container: '#4e3e00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad8'
  primary-fixed-dim: '#ffb3b1'
  on-primary-fixed: '#410008'
  on-primary-fixed-variant: '#82252a'
  secondary-fixed: '#ffdad8'
  secondary-fixed-dim: '#ffb3b0'
  on-secondary-fixed: '#410006'
  on-secondary-fixed-variant: '#8f0e1e'
  tertiary-fixed: '#ffe084'
  tertiary-fixed-dim: '#e3c465'
  on-tertiary-fixed: '#231b00'
  on-tertiary-fixed-variant: '#574500'
  background: '#f4fafe'
  on-background: '#161c1f'
  surface-variant: '#dde3e7'
  dark-red: '#691918'
  highlight-gold: '#C9A455'
  border-gray: '#BFBFBF'
  text-main: '#221913'
  text-muted: '#78736F'
  surface-white: '#FFFFFF'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  container-max-width: 600px
  gutter: 1rem
  margin-mobile: 1.25rem
  stack-sm: 0.5rem
  stack-md: 1rem
  stack-lg: 2rem
---

## Brand & Style

The design system is engineered for a high-trust, utility-focused service providing roadtax and insurance solutions. The brand personality is **dependable, efficient, and professional**, aimed at Malaysian vehicle owners who value speed and clarity. 

The aesthetic follows a **Corporate/Modern** style with a heavy lean toward **Minimalism**. By utilizing a high-contrast palette of deep reds and light grays, the interface guides users through complex forms with zero distraction. The visual narrative centers on "The Path to Protection," using structured white cards to contain information against a grounding neutral background, ensuring the user feels supported and secure throughout the quotation process.

## Colors

The palette is anchored by a sophisticated **Primary Red**, conveying authority and urgency suitable for insurance services. The **CTA Red** is reserved exclusively for primary actions to maximize conversion. 

- **Primary & Secondary:** Used for branding, headers, and critical interaction points.
- **Accent Gold:** Employed sparingly for trust badges, "Best Value" highlights, or premium status indicators.
- **Background & Surface:** The interface utilizes a layered approach with a light-gray background (`#D9DFE3`) and pure white cards (`#FFFFFF`) to create distinct visual hierarchy without relying on heavy shadows.
- **Typography:** `text-main` provides high legibility for data entry, while `text-muted` is utilized for secondary instructions and placeholder text.

## Typography

This design system uses a dual-font strategy to balance character with functionality. 

**Manrope** is used for headlines to project a modern, refined, and trustworthy image. Its geometric yet approachable curves work well for financial services. 

**Inter** is the workhorse for all body copy, labels, and form inputs. It is chosen for its exceptional legibility at small sizes and its neutral, systematic feel, which is essential for reading policy details and price breakdowns. 

- Use **Headline-LG** for page titles within the mobile-first card view.
- Use **Label-MD** for all form field titles to ensure they are distinct from the user's input.
- **Body-SM** should be used for legal disclaimers and secondary metadata.

## Layout & Spacing

The layout philosophy follows a **centered single-column model**, optimized for mobile use but aesthetically balanced for desktop. 

- **The Main Vessel:** On desktop, all content is contained within a fixed-width card (max 600px) centered horizontally on the screen. This reduces eye strain and keeps the user's focus on the linear quotation flow.
- **Rhythm:** A strict vertical rhythm is maintained using 8px increments. 
- **Responsive Behavior:** 
  - **Mobile:** Elements stretch to the full width of the screen with `margin-mobile` padding on the left and right.
  - **Tablet/Desktop:** The background (`#D9DFE3`) is visible around the central card.
- **Padding:** Internal card padding should be generous (24px to 32px) to prevent the UI from feeling cramped.

## Elevation & Depth

Hierarchy is established through **tonal layering** and **low-contrast outlines** rather than aggressive shadows. 

1.  **Base Layer:** The `background` color (#D9DFE3) serves as the canvas.
2.  **Surface Layer:** White cards (#FFFFFF) sit on the base. They use a 1px border (`border-gray`) to define their boundaries.
3.  **Elevation:** Use a single, very soft ambient shadow for the main interactive card to lift it slightly from the background (`0px 4px 12px rgba(0,0,0,0.05)`).
4.  **State Changes:** Focused input fields should transition from the gray border to a `primary-red` border with a subtle 2px glow of the same color at 10% opacity.

## Shapes

The design system adopts a **Soft (0.25rem)** roundedness level. This choice reflects a balance between the rigid "sharp" lines of traditional corporate banking and the overly "bubbly" feel of consumer apps.

- **Standard Elements:** Buttons, input fields, and small chips use a 4px radius.
- **Containers:** Large cards and sections may use `rounded-lg` (8px) to feel more substantial and modern.
- **Consistency:** All interactive elements must share the same corner radius to maintain a unified, professional appearance.

## Components

### Buttons
- **Primary:** Background `CTA red` (#C53A40), text `white`. Bold, high-contrast, and 48px height for mobile tappability.
- **Secondary/Outline:** Border `primary red`, text `primary red`, background transparent.

### Input Fields
- **Default:** White background with `border-gray` (#BFBFBF).
- **Active/Focus:** 1px `primary red` border. 
- **Labels:** Always visible above the input using `label-md` in `text-main`.

### Cards
- Pure white background.
- 1px `border-gray` for definition.
- Used to group logical steps in the quotation process (e.g., Vehicle Details, Owner Info, Coverage Options).

### Chips & Badges
- Used for indicating status (e.g., "Active", "Pending") or selecting insurance add-ons. 
- Use `highlight-gold` with 10% opacity for the background and `tertiary-gold` for the text to denote "Recommended" or "Premium" choices.

### Lists
- Clean, border-bottom separation using `border-gray`. 
- High-contrast `text-main` for list items with `text-muted` for sub-labels.

### Progress Indicator
- A simple, thin bar at the top of the card sequence using `primary red` to show the user's journey through the quotation funnel.