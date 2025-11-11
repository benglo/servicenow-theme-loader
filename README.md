# ServiceNow Theme Loader

A JavaScript utility for loading and applying ServiceNow theme JSON files at runtime. This allows local development and testing of themes without publishing components to a ServiceNow instance.

## Features

- 🎨 Load ServiceNow theme JSON files directly
- 🔄 Runtime theme switching (light/dark/custom)
- 💾 Automatic caching for performance
- 🔧 Merge multiple theme files
- ✅ Theme validation
- 🚀 Zero build step required
- 🔍 Easy debugging via browser DevTools

## Installation

Copy the entire `servicenow-theme-loader/` directory into your project:

```
your-project/
└── servicenow-theme-loader/
    ├── index.js
    ├── parser.js
    ├── README.md
    └── themes/
        ├── polaris/                    # Parent theme
        │   ├── shape-and-form.json    # Shared files
        │   ├── typography.json        # Shared files
        │   └── variants/
        │       ├── light/
        │       │   └── colors.json    # Light variant
        │       └── dark/
        │           └── colors.json    # Dark variant
        └── README.md
```

The entire folder is portable and can be zipped/shared between projects.

## Quick Start

### Basic Usage (Production/Static Server)

```javascript
import { ServiceNowThemeLoader } from './servicenow-theme-loader/index.js';

// Create theme loader instance
const loader = new ServiceNowThemeLoader();

// Load ServiceNow light theme
await loader.loadLightTheme();

// Your component will now pick up the theme variables
```

### Usage with ServiceNow CLI Dev Server

The ServiceNow CLI dev server uses webpack and doesn't serve arbitrary static files. Use JSON imports with preloaded themes:

```javascript
import { ServiceNowThemeLoader } from '../servicenow-theme-loader/index.js';

// Import theme JSON files (webpack supports JSON imports natively)
import polarisLightColors from '../servicenow-theme-loader/themes/polaris/variants/light/colors.json';
import polarisDarkColors from '../servicenow-theme-loader/themes/polaris/variants/dark/colors.json';
import polarisShapeForm from '../servicenow-theme-loader/themes/polaris/shape-and-form.json';
import polarisTypography from '../servicenow-theme-loader/themes/polaris/typography.json';

// Initialize with preloaded themes
const loader = new ServiceNowThemeLoader({
  preloadedThemes: {
    'themes/polaris/variants/light/colors.json': polarisLightColors,
    'themes/polaris/variants/dark/colors.json': polarisDarkColors,
    'themes/polaris/shape-and-form.json': polarisShapeForm,
    'themes/polaris/typography.json': polarisTypography
  }
});

// Load themes as normal
await loader.loadLightTheme();
```

**Note**: Webpack's JSON import support doesn't require the `with { type: 'json' }` syntax - simple imports work natively.

## Quick Theme Switcher Setup

The easiest way to add theme switching is with the `withThemes()` wrapper function. It automatically:
- Creates and configures the theme loader
- Loads the default theme
- Injects a theme switcher dropdown
- Auto-detects available themes from your imports

```javascript
import { withThemes } from '../servicenow-theme-loader/theme-switcher.js';

// Import theme JSON files
import polarisLightColors from '../servicenow-theme-loader/themes/polaris/variants/light/colors.json';
import polarisDarkColors from '../servicenow-theme-loader/themes/polaris/variants/dark/colors.json';
import polarisShapeForm from '../servicenow-theme-loader/themes/polaris/shape-and-form.json';
import polarisTypography from '../servicenow-theme-loader/themes/polaris/typography.json';

// Wrap your app initialization
withThemes({
  'themes/polaris/variants/light/colors.json': polarisLightColors,
  'themes/polaris/variants/dark/colors.json': polarisDarkColors,
  'themes/polaris/shape-and-form.json': polarisShapeForm,
  'themes/polaris/typography.json': polarisTypography
}, async (themeLoader) => {
  // Theme loaded! Dropdown created! Just initialize your app:

  const sidebar = document.getElementById('my-sidebar');
  sidebar.navItems = [...];
  // ... rest of your app code
});
```

The theme switcher dropdown automatically appears in the top-right corner and detects all available themes/variants from your imports.

### withThemes() Options

```javascript
withThemes(preloadedThemes, options, initFn);
```

**Parameters:**
- `preloadedThemes` (Object): Theme objects keyed by path
- `options` (Object, optional): Configuration options
- `initFn` (Function): Your app initialization function

**Available options:**
```javascript
{
  defaultTheme: 'polaris',      // Default theme name (auto-detected if omitted)
  defaultVariant: 'light',      // Default variant (auto-detected if omitted)
  showSwitcher: true,           // Show theme switcher UI
  enableCache: true,            // Enable theme caching
  debug: true,                  // Expose window.themeLoader for debugging
  globalName: 'myThemeLoader'   // Custom global variable name
}
```

### Adding Custom Themes

To add a custom theme, just import the files and add them to the preloadedThemes object:

```javascript
// Import your custom theme
import coralLightColors from '../servicenow-theme-loader/themes/coral/variants/light/colors.json';
import coralDarkColors from '../servicenow-theme-loader/themes/coral/variants/dark/colors.json';
import coralShapeForm from '../servicenow-theme-loader/themes/coral/shape-and-form.json';
import coralTypography from '../servicenow-theme-loader/themes/coral/typography.json';

withThemes({
  // ... polaris themes
  'themes/coral/variants/light/colors.json': coralLightColors,
  'themes/coral/variants/dark/colors.json': coralDarkColors,
  'themes/coral/shape-and-form.json': coralShapeForm,
  'themes/coral/typography.json': coralTypography
}, async (themeLoader) => {
  // Dropdown now shows: Polaris - Light, Polaris - Dark, Coral - Light, Coral - Dark
});
```

The dropdown automatically updates with your custom themes!

### Using the Web Component Directly

For more control, you can use the `<theme-switcher>` web component directly:

```javascript
import { ServiceNowThemeLoader } from '../servicenow-theme-loader/index.js';
import '../servicenow-theme-loader/theme-switcher.js'; // Registers the component

const loader = new ServiceNowThemeLoader({...});
await loader.loadLightTheme();

// Create and configure switcher
const switcher = document.createElement('theme-switcher');
switcher.loader = loader;
switcher.themes = {
  polaris: { variants: ['light', 'dark'], files: {...} }
};
switcher.currentTheme = 'polaris:light';

document.body.appendChild(switcher);

// Listen to theme changes
switcher.addEventListener('theme-changed', (e) => {
  console.log('Theme changed:', e.detail); // { themeName, variant }
});
```

### Customizing Theme Switcher Appearance

The theme switcher uses CSS custom properties for styling:

```css
theme-switcher {
  --theme-switcher-top: 20px;
  --theme-switcher-right: 20px;
  --theme-switcher-z-index: 10000;
  --theme-switcher-background: white;
  --theme-switcher-border-radius: 8px;
  --theme-switcher-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  --theme-switcher-font-family: 'Inter', sans-serif;
  --theme-switcher-font-size: 14px;
  --theme-switcher-label-color: #333;
  --theme-switcher-border-color: #ddd;
  --theme-switcher-border-hover-color: #999;
  --theme-switcher-border-focus-color: #0066cc;
  --theme-switcher-select-background: white;
  --theme-switcher-text-color: #333;
}
```

Or hide it completely:

```javascript
withThemes(preloadedThemes, { showSwitcher: false }, async (loader) => {
  // No dropdown created - manual theme control only
});
```

### Manual Theme Switching

```javascript
// Switch to dark theme
document.getElementById('dark-mode-toggle').addEventListener('click', async () => {
  await loader.loadDarkTheme();  // Or: await loader.loadTheme('polaris', 'dark');
});

// Switch back to light theme
document.getElementById('light-mode-toggle').addEventListener('click', async () => {
  await loader.loadLightTheme();  // Or: await loader.loadTheme('polaris', 'light');
});

// Load a different theme entirely
await loader.loadTheme('coral', 'dark');
```

## API Reference

### Constructor

```javascript
const loader = new ServiceNowThemeLoader(options);
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `basePath` | string | `''` | Base path for theme file URLs |
| `enableCache` | boolean | `true` | Enable theme file caching |
| `styleElementId` | string | `'servicenow-theme'` | (Deprecated - not currently used) |
| `preloadedThemes` | object | `{}` | Preloaded theme objects keyed by path (for dev servers) |

**Example:**

```javascript
const loader = new ServiceNowThemeLoader({
  basePath: '../',
  enableCache: true,
  styleElementId: 'my-theme'
});
```

### Methods

#### `loadTheme(themeName, variant)`

Load a theme with a specific variant. This is the recommended way to load themes.

```javascript
await loader.loadTheme('polaris', 'dark');
await loader.loadTheme('coral', 'light');
```

**Parameters:**
- `themeName` (String): Theme name (folder name in themes/)
- `variant` (String): Variant name (e.g., 'light', 'dark')

**Returns:** `Promise<Object>` - Merged theme data

---

#### `loadSingleTheme(themePath)`

Load a single theme JSON file (advanced usage).

```javascript
const themeData = await loader.loadSingleTheme('themes/polaris/shape-and-form.json');
```

**Returns:** `Promise<Object>` - Theme data object

---

#### `loadThemeSet(themePaths)`

Load and merge multiple theme files. Later files override earlier files.

```javascript
await loader.loadThemeSet([
  'servicenow_styles/colors.json',
  'servicenow_styles/shape and form.json',
  'servicenow_styles/typopgrahy.json'
]);
```

**Returns:** `Promise<Object>` - Merged theme data

---

#### `loadLightTheme()`

Load the standard ServiceNow light theme (colors + shape/form + typography).

```javascript
await loader.loadLightTheme();
```

**Returns:** `Promise<Object>` - Merged theme data

---

#### `loadDarkTheme()`

Load the standard ServiceNow dark theme (dark colors + shape/form + typography).

```javascript
await loader.loadDarkTheme();
```

**Returns:** `Promise<Object>` - Merged theme data

---

#### `loadAndApply(themePath)`

Load a single theme file and apply it immediately.

```javascript
await loader.loadAndApply('servicenow_styles/colors.json');
```

**Returns:** `Promise<Object>` - Theme data

---

#### `removeTheme()`

Clear the active theme reference. Note: CSS custom properties remain set in the DOM until overwritten.

```javascript
loader.removeTheme();
```

---

#### `clearCache()`

Clear the theme file cache. Useful during development when theme files are modified.

```javascript
loader.clearCache();
await loader.loadLightTheme(); // Will fetch fresh from server
```

---

#### `getActiveTheme()`

Get the currently active theme path(s).

```javascript
const activeTheme = loader.getActiveTheme();
console.log(activeTheme); // 'servicenow_styles/colors.json' or ['...', '...']
```

**Returns:** `String|String[]|null`

---

#### `getCacheStats()`

Get cache statistics for debugging.

```javascript
const stats = loader.getCacheStats();
console.log(stats); // { size: 3, keys: [...] }
```

**Returns:** `Object` - { size, keys }

## Advanced Usage

### Adding Custom Themes

See [themes/README.md](themes/README.md) for detailed instructions on creating and loading custom themes.

Quick example:
```javascript
// Create themes/coral/ folder with parent files and variant colors
// themes/coral/shape-and-form.json
// themes/coral/typography.json
// themes/coral/variants/light/colors.json
// themes/coral/variants/dark/colors.json

// Load with the convenience method
await loader.loadTheme('coral', 'light');
await loader.loadTheme('coral', 'dark');
```

### Custom Theme Combinations

Load specific theme files in custom combinations:

```javascript
await loader.loadThemeSet([
  'servicenow_styles/colors.json',       // Base colors
  'custom/brand-colors.json',            // Your brand overrides
  'servicenow_styles/shape and form.json', // Platform structure
  'custom/custom-spacing.json'           // Your spacing overrides
]);
```

### Cache Management

```javascript
// Disable caching for development
const loader = new ServiceNowThemeLoader({ enableCache: false });

// Or clear cache when needed
loader.clearCache();

// Check cache status
const stats = loader.getCacheStats();
console.log(`Cached ${stats.size} theme files`);
```

## Theme File Format

ServiceNow theme files use JSON with two main sections:

```json
{
  "base": {
    "--now-color--neutral": "61,74,80",
    "--now-color--primary": "0,128,163"
  },
  "properties": {
    "--now-color_background--primary": "--now-color--neutral-0",
    "--now-color_text--primary": "--now-color--neutral-18"
  }
}
```

### Base Section

Contains primitive RGB values (no `RGB()` wrapper):

```json
{
  "base": {
    "--now-color--neutral": "61,74,80",
    "--now-color--primary": "0,128,163"
  }
}
```

These become CSS custom properties:

```css
:root {
  --now-color--neutral: 61,74,80;
  --now-color--primary: 0,128,163;
}
```

### Properties Section

Contains semantic references to base colors or other properties:

```json
{
  "properties": {
    "--now-color_background--primary": "--now-color--neutral-0",
    "--now-color_text--primary": "--now-color--neutral-18"
  }
}
```

These become CSS with `var()` references:

```css
:root {
  --now-color_background--primary: var(--now-color--neutral-0);
  --now-color_text--primary: var(--now-color--neutral-18);
}
```

## How Components Use Themes

Your SCSS components can reference these variables:

```scss
// In your _theme.scss file
$component--background-color: RGB(var(
  --component--background-color,              // Component override
  var(--now-color_background--secondary,      // Platform semantic
    var(--now-color--neutral-1,               // Platform base
      245, 245, 247                           // Hardcoded fallback
    )
  )
));

// In your styles.scss file
.my-component {
  background-color: $component--background-color;
}
```

The cascade works as:
1. Component override (`--component--background-color`)
2. Platform semantic (`--now-color_background--secondary`)
3. Platform base (`--now-color--neutral-1`)
4. Hardcoded fallback (245, 245, 247)

## Troubleshooting

### Themes Not Applying

1. Check browser console for load errors
2. Verify theme file paths are correct
3. Ensure files are served by your development server
4. Check that component SCSS references platform tokens

### CSS Variables Not Found

1. Verify theme files have correct structure
2. Check that property names match what your component expects
3. Ensure theme is loaded before component renders

### Cache Issues

Clear the cache if theme files are updated:

```javascript
loader.clearCache();
await loader.loadLightTheme();
```

Or disable caching during development:

```javascript
const loader = new ServiceNowThemeLoader({ enableCache: false });
```

## Browser Support

Works in all modern browsers that support:
- ES6 modules
- Async/await
- Fetch API
- CSS Custom Properties

## Debugging

Inspect theme variables in browser DevTools:

1. Open DevTools (F12)
2. Go to Elements tab
3. Select `<html>` element
4. View Computed styles
5. Search for `--now-` or your component prefix

You can also modify variables live:

```javascript
document.documentElement.style.setProperty('--now-color--primary', '255, 0, 0');
```

## Reusability

This theme loader is designed to be reusable across multiple component projects:

1. Copy the entire `servicenow-theme-loader/` folder to your new project
2. Import and use in your example/demo files
3. Optionally add your own custom themes to the `themes/` folder
4. No modifications needed!

The entire folder is portable and can be zipped/shared between projects. Alternatively, package as an npm module for even easier sharing.

## License

MIT
