/**
 * ServiceNow Theme Loader - Example Boilerplate
 * 
 * This file provides a ready-to-use setup for loading ServiceNow themes
 * with your component. Just add your component initialization code where indicated.
 * 
 * Usage:
 * 1. Copy this file to your project
 * 2. Update the import paths to point to servicenow-theme-loader
 * 3. Add your component initialization in the marked section
 * 4. Run with: node example.js (or include in your HTML)
 */

import { withThemes } from './theme-switcher.js';

//Import component
import '../src/custom-component';

// Import Coral theme files (change to 'polaris' if you prefer)
import coralLightColors from './themes/coral/variants/light/colors.json';
import coralDarkColors from './themes/coral/variants/dark/colors.json';
import coralShapeForm from './themes/coral/shape-and-form.json';
import coralTypography from './themes/coral/typography.json';

// Optional: Import additional themes (uncomment if needed)
// import polarisLightColors from './themes/polaris/variants/light/colors.json';
// import polarisDarkColors from './themes/polaris/variants/dark/colors.json';
// import polarisShapeForm from './themes/polaris/shape-and-form.json';
// import polarisTypography from './themes/polaris/typography.json';

// Configure preloaded themes
const preloadedThemes = {
  'themes/coral/variants/light/colors.json': coralLightColors,
  'themes/coral/variants/dark/colors.json': coralDarkColors,
  'themes/coral/shape-and-form.json': coralShapeForm,
  'themes/coral/typography.json': coralTypography,
  
  // Optional: Add Polaris themes (uncomment if imported above)
  // 'themes/polaris/variants/light/colors.json': polarisLightColors,
  // 'themes/polaris/variants/dark/colors.json': polarisDarkColors,
  // 'themes/polaris/shape-and-form.json': polarisShapeForm,
  // 'themes/polaris/typography.json': polarisTypography,
};

// Optional: Configure theme loader options
const themeOptions = {
  defaultTheme: 'coral',      // Default theme name
  defaultVariant: 'light',    // Default variant (light/dark)
  showSwitcher: true,         // Show theme switcher dropdown in top-right
  enableCache: true,          // Cache loaded themes
  debug: true,                // Expose themeLoader globally for debugging (window.themeLoader)
  // globalName: 'myThemeLoader' // Custom global variable name (optional)
};

// Initialize themes and your component
withThemes(preloadedThemes, themeOptions, async (themeLoader) => {
  console.log('✅ Theme loaded successfully!');
  console.log('Active theme:', themeLoader.getActiveTheme());

  // ============================================
  // YOUR COMPONENT INITIALIZATION STARTS HERE
  // ============================================    

    // const el = document.createElement('DIV');
    // document.body.appendChild(el);

    // el.innerHTML = `
    // 	<x-123456-custom-component></x-123456-custom-component>
    // `;

  
  // ============================================
  // YOUR COMPONENT INITIALIZATION ENDS HERE
  // ============================================
  
  // Optional: Listen for theme changes
  const switcher = document.querySelector('theme-switcher');
  if (switcher) {
    switcher.addEventListener('theme-changed', (event) => {
      const { themeName, variant } = event.detail;
      console.log(`🎨 Theme changed to: ${themeName} - ${variant}`);
      
      // Optional: Refresh components or update state after theme change
      // refreshComponentStyles();
    });
  }
});

