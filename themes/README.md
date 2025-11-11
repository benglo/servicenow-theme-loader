# ServiceNow Themes

This directory contains theme JSON files for the ServiceNow Theme Loader.

## Theme Structure

Themes follow a parent/variant pattern matching ServiceNow's actual theme system:

```
themes/
└── polaris/                     # Parent theme (Polaris, Coral, Utah, etc.)
    ├── shape-and-form.json     # Shared across all variants
    ├── typography.json         # Shared across all variants
    └── variants/
        ├── light/              # Light variant
        │   └── colors.json     # Light-specific colors
        └── dark/               # Dark variant
            └── colors.json     # Dark-specific colors
```

**Key Benefits:**
- Shape and typography are defined once in the parent
- Only colors change between variants (light/dark)
- No duplication
- Matches ServiceNow's theme architecture

## Included Themes

### Polaris (Default ServiceNow Theme)
- **Parent files**: Standard ServiceNow spacing, borders, and typography
- **Light variant**: Standard light colors
- **Dark variant**: Dark mode optimized colors

## Adding Custom Themes

### 1. Create Theme Structure

Create a parent theme folder with variant subfolders:

```
themes/
└── coral/                      # Your theme name
    ├── shape-and-form.json    # Parent files (shared)
    ├── typography.json        # Parent files (shared)
    └── variants/
        ├── light/
        │   └── colors.json    # Light variant colors
        └── dark/
            └── colors.json    # Dark variant colors
```

### 2. Add Parent Files

**shape-and-form.json** (at `themes/coral/`)
```json
{
  "base": {},
  "properties": {
    "--now-spacing--sm": "8px",
    "--now-spacing--md": "16px",
    "--now-border-radius--md": "4px"
  }
}
```

**typography.json** (at `themes/coral/`)
```json
{
  "base": {},
  "properties": {
    "--now-font-size--md": "14px",
    "--now-font-weight--regular": "400",
    "--now-font-weight--semibold": "600"
  }
}
```

### 3. Add Variant Colors

**light/colors.json** (at `themes/coral/variants/light/`)
```json
{
  "base": {
    "--now-color--neutral": "61,74,80",
    "--now-color--primary": "255,127,80",
    "--now-color--secondary": "255,160,122"
  },
  "properties": {
    "--now-color_background--primary": "--now-color--neutral-0",
    "--now-color_text--primary": "--now-color--neutral-18"
  }
}
```

**dark/colors.json** (at `themes/coral/variants/dark/`)
```json
{
  "base": {
    "--now-color--neutral": "61,74,80",
    "--now-color--primary": "255,127,80",
    "--now-color--secondary": "255,182,193"
  },
  "properties": {
    "--now-color_background--primary": "--now-color--neutral-20",
    "--now-color_text--primary": "--now-color--neutral-0"
  }
}
```

### 4. Load Custom Theme

#### Option A: Using the convenience method

```javascript
const loader = new ServiceNowThemeLoader();

// Load your custom theme with a variant
await loader.loadTheme('coral', 'light');  // Coral light
await loader.loadTheme('coral', 'dark');   // Coral dark
```

#### Option B: Using preloaded themes (webpack/dev server)

```javascript
import coralLightColors from '../servicenow-theme-loader/themes/coral/variants/light/colors.json';
import coralDarkColors from '../servicenow-theme-loader/themes/coral/variants/dark/colors.json';
import coralShape from '../servicenow-theme-loader/themes/coral/shape-and-form.json';
import coralTypography from '../servicenow-theme-loader/themes/coral/typography.json';

const loader = new ServiceNowThemeLoader({
  preloadedThemes: {
    'themes/coral/variants/light/colors.json': coralLightColors,
    'themes/coral/variants/dark/colors.json': coralDarkColors,
    'themes/coral/shape-and-form.json': coralShape,
    'themes/coral/typography.json': coralTypography
  }
});

// Load your theme
await loader.loadTheme('coral', 'light');
```

#### Option C: Using fetch (production)

```javascript
const loader = new ServiceNowThemeLoader();

// Load manually with loadThemeSet
await loader.loadThemeSet([
  'servicenow-theme-loader/themes/coral/variants/light/colors.json',
  'servicenow-theme-loader/themes/coral/shape-and-form.json',
  'servicenow-theme-loader/themes/coral/typography.json'
]);
```

## Theme File Format

### Base Section
RGB color values without `RGB()` wrapper:

```json
{
  "base": {
    "--now-color--neutral": "61,74,80",
    "--now-color--primary": "0,128,163"
  }
}
```

### Properties Section
References to other variables or direct values:

```json
{
  "properties": {
    "--now-color_background--primary": "--now-color--neutral-0",
    "--now-spacing--md": "16px"
  }
}
```

### Color Scale Generation

The theme loader automatically generates color scales:

**4-point scales** (primary, secondary, alerts):
- Index 0: Lightest tint
- Index 1: Base color (your input)
- Index 2: Darker shade
- Index 3: Darkest shade

**22-point scale** (neutral only):
- Index 0: White
- Index 21: Black
- Intermediate: Gradual interpolation

## Tips

1. **Start with existing theme**: Copy `servicenow-light` or `servicenow-dark` as a starting point
2. **Test incrementally**: Load just colors first, then add shape and typography
3. **Use browser DevTools**: Inspect CSS custom properties in Elements tab
4. **Validate JSON**: Ensure files are valid JSON before loading
5. **Base colors only**: Only define base colors (e.g., `--now-color--primary`), the loader generates scales automatically

## Troubleshooting

**Theme not applying:**
- Check browser console for JSON parse errors
- Verify file paths in `loadThemeSet()` match actual file locations
- Ensure JSON files have correct structure (base and properties sections)

**Colors look wrong:**
- Base colors should be RGB format: `"61,74,80"` not `"RGB(61,74,80)"`
- Properties should reference variables: `"--now-color--neutral-0"` not the color directly

**Scale colors missing:**
- The loader automatically generates scales from base colors
- Ensure base colors are defined in the colors.json base section
