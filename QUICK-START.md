# Quick Start: Using Theme Switcher on Any Component

This guide shows you how to add theme switching to any ServiceNow UI Component project in under 5 minutes.

## Step 1: Copy the Theme Loader

Copy the entire `servicenow-theme-loader/` folder into your component project:

```
your-component-project/
├── src/
├── example/
│   └── element.js                     # Your demo file
└── servicenow-theme-loader/          # ← Copy this entire folder
    ├── index.js
    ├── parser.js
    ├── theme-switcher.js
    ├── README.md
    └── themes/
        └── polaris/
            ├── shape-and-form.json
            ├── typography.json
            └── variants/
                ├── light/
                │   └── colors.json
                └── dark/
                    └── colors.json
```

## Step 2: Update Your element.js

Open your `example/element.js` and add these imports at the top:

```javascript
import { withThemes } from '../servicenow-theme-loader/theme-switcher.js';

// Import theme JSON files
import polarisLightColors from '../servicenow-theme-loader/themes/polaris/variants/light/colors.json';
import polarisDarkColors from '../servicenow-theme-loader/themes/polaris/variants/dark/colors.json';
import polarisShapeForm from '../servicenow-theme-loader/themes/polaris/shape-and-form.json';
import polarisTypography from '../servicenow-theme-loader/themes/polaris/typography.json';
```

## Step 3: Wrap Your Initialization Code

Find your component initialization code (usually an async function or direct setup):

**Before:**
```javascript
// Your current code
async function init() {
  const myComponent = document.getElementById('my-component');
  myComponent.config = {...};
  // ... rest of setup
}

init();
```

**After:**
```javascript
withThemes({
  'themes/polaris/variants/light/colors.json': polarisLightColors,
  'themes/polaris/variants/dark/colors.json': polarisDarkColors,
  'themes/polaris/shape-and-form.json': polarisShapeForm,
  'themes/polaris/typography.json': polarisTypography
}, async (themeLoader) => {
  // Your existing initialization code goes here:
  const myComponent = document.getElementById('my-component');
  myComponent.config = {...};
  // ... rest of setup
});
```

## Step 4: Test It!

Run your dev server:

```bash
snc ui-component develop
```

You should see:
1. ✅ Theme automatically loads (Polaris Light by default)
2. ✅ Dropdown appears in top-right corner
3. ✅ Switch between Light/Dark themes works instantly

## Complete Example

Here's a complete minimal example:

```javascript
import '../src/x-123456-my-component';
import { withThemes } from '../servicenow-theme-loader/theme-switcher.js';

// Import theme files
import polarisLightColors from '../servicenow-theme-loader/themes/polaris/variants/light/colors.json';
import polarisDarkColors from '../servicenow-theme-loader/themes/polaris/variants/dark/colors.json';
import polarisShapeForm from '../servicenow-theme-loader/themes/polaris/shape-and-form.json';
import polarisTypography from '../servicenow-theme-loader/themes/polaris/typography.json';

// Initialize with themes
withThemes({
  'themes/polaris/variants/light/colors.json': polarisLightColors,
  'themes/polaris/variants/dark/colors.json': polarisDarkColors,
  'themes/polaris/shape-and-form.json': polarisShapeForm,
  'themes/polaris/typography.json': polarisTypography
}, async (themeLoader) => {
  // Set up your component
  document.body.innerHTML = `
    <x-123456-my-component id="demo">
      <p>Hello World</p>
    </x-123456-my-component>
  `;

  const component = document.getElementById('demo');
  component.someProperty = 'value';

  console.log('Component initialized with theme support!');
});
```

## Options

Customize the behavior with options:

```javascript
withThemes(
  preloadedThemes,
  {
    defaultTheme: 'polaris',      // Which theme to load (default: first found)
    defaultVariant: 'dark',       // Which variant to load (default: 'light')
    showSwitcher: true,           // Show the dropdown (default: true)
    enableCache: true,            // Cache theme files (default: true)
    debug: true                   // Expose window.themeLoader (default: true)
  },
  async (themeLoader) => {
    // Your code
  }
);
```

## Hiding the Dropdown

If you want themes but not the UI:

```javascript
withThemes(
  preloadedThemes,
  { showSwitcher: false },  // No dropdown
  async (themeLoader) => {
    // Manually switch themes via themeLoader
    await themeLoader.loadTheme('polaris', 'dark');
  }
);
```

## Customizing Dropdown Position

The dropdown uses CSS custom properties:

```css
theme-switcher {
  --theme-switcher-top: 20px;     /* Distance from top */
  --theme-switcher-right: 20px;   /* Distance from right */
  --theme-switcher-z-index: 9999; /* Stack order */
}
```

## Troubleshooting

### Theme not applying?

1. Check browser console for errors
2. Verify theme JSON files are in correct location
3. Make sure import paths are correct
4. Clear cache and refresh

### Dropdown not showing?

1. Check `showSwitcher` option is not set to `false`
2. Verify `withThemes()` is called before DOM loads
3. Look for JavaScript errors in console

### Colors look wrong?

1. Ensure your component uses ServiceNow theme tokens (`--now-color--*`)
2. Check component SCSS has proper fallback values
3. Verify theme JSON files have correct RGB format

## Next Steps

- Read full documentation: [`README.md`](./README.md)
- Add custom themes: [`themes/README.md`](./themes/README.md)
- Customize appearance: See CSS custom properties in main README

## Need Help?

Check the full API reference in [`README.md`](./README.md) or review the example implementation in `example/element.js`.
