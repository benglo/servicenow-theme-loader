import { ThemeParser } from './parser.js';

/**
 * ServiceNowThemeLoader
 * Loads and applies ServiceNow theme JSON files to the DOM
 *
 * This class handles loading theme files (colors.json, dark.json, etc.),
 * parsing them into CSS custom properties, and injecting them into the page.
 *
 * @example
 * const loader = new ServiceNowThemeLoader();
 * await loader.loadLightTheme();
 *
 * @example
 * // Custom theme combination
 * await loader.loadThemeSet([
 *   'servicenow_styles/colors.json',
 *   'custom-overrides.json'
 * ]);
 */
export class ServiceNowThemeLoader {
	/**
	 * Create a new theme loader
	 * @param {Object} options - Configuration options
	 * @param {String} options.basePath - Base path for theme files (default: '')
	 * @param {Boolean} options.enableCache - Enable theme caching (default: true)
	 * @param {String} options.styleElementId - ID for injected style element (default: 'servicenow-theme')
	 * @param {Object} options.preloadedThemes - Preloaded theme objects keyed by path (for dev server compatibility)
	 */
	constructor(options = {}) {
		this.parser = new ThemeParser();
		this.styleElement = null;
		this.activeTheme = null;
		this.basePath = options.basePath || '';
		this.enableCache = options.enableCache !== false;
		this.styleElementId = options.styleElementId || 'servicenow-theme';
		this.cache = new Map();
		this.preloadedThemes = options.preloadedThemes || {};
	}

	/**
	 * Load a single theme JSON file
	 * @param {String} themePath - Path to theme JSON file (relative to basePath)
	 * @returns {Promise<Object>} Theme data object
	 */
	async loadSingleTheme(themePath) {
		// Check if theme is preloaded (for dev server compatibility)
		if (this.preloadedThemes[themePath]) {
			const themeData = this.preloadedThemes[themePath];

			// Validate theme structure
			const validation = this.parser.validate(themeData);
			if (!validation.valid) {
				console.warn(`Theme validation warnings for ${themePath}:`, validation.errors);
			}

			return themeData;
		}

		const fullPath = this.basePath + themePath;

		// Check cache
		if (this.enableCache && this.cache.has(fullPath)) {
			return this.cache.get(fullPath);
		}

		try {
			const response = await fetch(fullPath);
			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			const themeData = await response.json();

			// Validate theme structure
			const validation = this.parser.validate(themeData);
			if (!validation.valid) {
				console.warn(`Theme validation warnings for ${themePath}:`, validation.errors);
			}

			if (this.enableCache) {
				this.cache.set(fullPath, themeData);
			}

			return themeData;
		} catch (error) {
			console.error(`Error loading theme from ${fullPath}:`, error);
			throw error;
		}
	}

	/**
	 * Apply theme directly to DOM using CSS custom properties
	 * @param {Object} themeData - Theme data with base and properties
	 */
	applyTheme(themeData) {
		const root = document.documentElement;

		// Apply base colors
		if (themeData.base) {
			Object.entries(themeData.base).forEach(([key, value]) => {
				if (key === 'isDark') return;
				root.style.setProperty(key, value);
			});
		}

		// Apply properties (with var() wrapping for references)
		if (themeData.properties) {
			Object.entries(themeData.properties).forEach(([key, value]) => {
				// If value references another variable, wrap in var()
				if (typeof value === 'string' && value.startsWith('--')) {
					root.style.setProperty(key, `var(${value})`);
				} else {
					root.style.setProperty(key, value);
				}
			});
		}

		console.log('✓ Theme applied via DOM manipulation');
	}

	/**
	 * Load and apply a single theme file
	 * @param {String} themePath - Path to theme JSON file
	 * @returns {Promise<Object>} Loaded theme data
	 */
	async loadAndApply(themePath) {
		const themeData = await this.loadSingleTheme(themePath);
		this.applyTheme(themeData);
		this.activeTheme = themePath;
		return themeData;
	}

	/**
	 * Load and merge multiple theme files
	 * Files are merged in order - later files override earlier files
	 *
	 * @param {String[]} themePaths - Array of theme file paths
	 * @returns {Promise<Object>} Merged theme data
	 *
	 * @example
	 * await loader.loadThemeSet([
	 *   'servicenow_styles/colors.json',
	 *   'servicenow_styles/shape and form.json',
	 *   'servicenow_styles/typopgrahy.json'
	 * ]);
	 */
	async loadThemeSet(themePaths) {
		const themes = await Promise.all(
			themePaths.map(path => this.loadSingleTheme(path))
		);

		const merged = this.parser.merge(themes);
		this.applyTheme(merged);
		this.activeTheme = themePaths;

		return merged;
	}

	/**
	 * Load a theme with a specific variant
	 * @param {String} themeName - Theme name (e.g., 'polaris', 'coral')
	 * @param {String} variant - Variant name (e.g., 'light', 'dark')
	 * @returns {Promise<Object>} Merged theme data
	 *
	 * @example
	 * await loader.loadTheme('polaris', 'dark');
	 */
	async loadTheme(themeName, variant) {
		return this.loadThemeSet([
			`themes/${themeName}/variants/${variant}/colors.json`,
			`themes/${themeName}/shape-and-form.json`,
			`themes/${themeName}/typography.json`
		]);
	}

	/**
	 * Load ServiceNow light theme (Polaris light variant)
	 * @returns {Promise<Object>} Merged light theme data
	 */
	async loadLightTheme() {
		return this.loadTheme('polaris', 'light');
	}

	/**
	 * Load ServiceNow dark theme (Polaris dark variant)
	 * @returns {Promise<Object>} Merged dark theme data
	 */
	async loadDarkTheme() {
		return this.loadTheme('polaris', 'dark');
	}

	/**
	 * Remove theme styles from DOM
	 * Clears all theme-related CSS custom properties
	 */
	removeTheme() {
		// Note: This doesn't actually remove properties, just clears the active theme reference
		// CSS custom properties will remain set until overwritten by another theme
		this.activeTheme = null;
		console.log('Theme reference cleared (CSS properties remain)');
	}

	/**
	 * Get currently active theme
	 * @returns {String|String[]|null} Active theme path(s) or null
	 */
	getActiveTheme() {
		return this.activeTheme;
	}

	/**
	 * Clear the theme cache
	 * Useful for development when theme files are modified
	 */
	clearCache() {
		this.cache.clear();
	}

	/**
	 * Get cache statistics
	 * @returns {Object} Cache stats { size, keys }
	 */
	getCacheStats() {
		return {
			size: this.cache.size,
			keys: Array.from(this.cache.keys())
		};
	}

	/**
	 * Debug helper: Log sample of current theme variables
	 */
	debugTheme() {
		if (!this.activeTheme) {
			console.log('No theme loaded');
			return;
		}

		console.log('Active theme:', this.activeTheme);

		// Check what's actually SET vs what's COMPUTED
		const rootElement = document.documentElement;
		const rootStyle = getComputedStyle(rootElement);

		console.log('Sample of what was SET:');
		console.log('  --now-color--secondary (base):', rootElement.style.getPropertyValue('--now-color--secondary'));
		console.log('  --now-color--secondary-1 (inline):', rootElement.style.getPropertyValue('--now-color--secondary-1'));
		console.log('  --now-color_background--secondary (inline):', rootElement.style.getPropertyValue('--now-color_background--secondary'));

		console.log('Sample of what COMPUTED to:');
		const testVars = [
			'--now-color--secondary',
			'--now-color--secondary-1',
			'--now-color--secondary-2',
			'--now-color_background--secondary',
			'--now-color_text--primary',
			'--now-color--neutral-1'
		];

		testVars.forEach(varName => {
			const value = rootStyle.getPropertyValue(varName).trim();
			console.log(`  ${varName}:`, value || 'NOT FOUND');
		});

		// Count how many CSS custom properties are set
		const allProps = Array.from(document.documentElement.style);
		const themeProps = allProps.filter(prop => prop.startsWith('--now-') || prop.startsWith('--uib-'));
		console.log(`Total theme properties set: ${themeProps.length}`);
	}
}

// Export default instance for convenience
export default ServiceNowThemeLoader;
