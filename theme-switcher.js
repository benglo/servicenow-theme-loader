import { ServiceNowThemeLoader } from './index.js';

/**
 * Parse theme structure from preloadedThemes keys
 * @param {Object} preloadedThemes - Preloaded theme objects keyed by path
 * @returns {Object} - { themes: { themeName: { variants: [], files: {} } } }
 *
 * @example
 * Input keys:
 *   'themes/polaris/variants/light/colors.json'
 *   'themes/polaris/variants/dark/colors.json'
 *   'themes/polaris/shape-and-form.json'
 *
 * Output:
 *   { themes: { polaris: { variants: ['light', 'dark'], files: {...} } } }
 */
export function parseThemeStructure(preloadedThemes) {
	const themes = {};

	Object.keys(preloadedThemes).forEach(path => {
		// Match pattern: themes/{themeName}/variants/{variant}/{file}.json
		const variantMatch = path.match(/themes\/([^/]+)\/variants\/([^/]+)\//);

		if (variantMatch) {
			const themeName = variantMatch[1];
			const variant = variantMatch[2];

			if (!themes[themeName]) {
				themes[themeName] = {
					variants: [],
					files: {}
				};
			}

			if (!themes[themeName].variants.includes(variant)) {
				themes[themeName].variants.push(variant);
			}

			themes[themeName].files[path] = preloadedThemes[path];
		}

		// Match pattern: themes/{themeName}/{file}.json (shared files)
		const sharedMatch = path.match(/themes\/([^/]+)\/([^/]+\.json)$/);

		if (sharedMatch) {
			const themeName = sharedMatch[1];

			if (!themes[themeName]) {
				themes[themeName] = {
					variants: [],
					files: {}
				};
			}

			themes[themeName].files[path] = preloadedThemes[path];
		}
	});

	// Sort variants to ensure 'light' comes first if it exists
	Object.values(themes).forEach(theme => {
		theme.variants.sort((a, b) => {
			if (a === 'light') return -1;
			if (b === 'light') return 1;
			if (a === 'dark') return -1;
			if (b === 'dark') return 1;
			return a.localeCompare(b);
		});
	});

	return { themes };
}

/**
 * Get display name for a theme variant
 * @param {String} themeName - Theme name (e.g., 'polaris')
 * @param {String} variant - Variant name (e.g., 'light')
 * @returns {String} - Display name (e.g., 'Polaris - Light')
 */
function getDisplayName(themeName, variant) {
	// Capitalize first letter of each word
	const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
	return `${capitalize(themeName)} - ${capitalize(variant)}`;
}

/**
 * Theme Switcher Web Component
 * Automatically renders a dropdown with detected themes
 */
class ThemeSwitcherElement extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this._themes = {};
		this._loader = null;
		this._currentTheme = null;
		this._currentVariant = null;
	}

	connectedCallback() {
		this.render();
	}

	set themes(value) {
		this._themes = value;
		this.render();
	}

	get themes() {
		return this._themes;
	}

	set loader(value) {
		this._loader = value;
	}

	get loader() {
		return this._loader;
	}

	set currentTheme(value) {
		const [themeName, variant] = value.split(':');
		this._currentTheme = themeName;
		this._currentVariant = variant;
		this.render();
	}

	get currentTheme() {
		return `${this._currentTheme}:${this._currentVariant}`;
	}

	async handleThemeChange(event) {
		const value = event.target.value;
		const [themeName, variant] = value.split(':');

		try {
			console.log(`Switching to ${themeName} ${variant}...`);

			await this._loader.loadTheme(themeName, variant);

			this._currentTheme = themeName;
			this._currentVariant = variant;

			console.log(`✓ Switched to ${themeName} ${variant}`);

			// Dispatch custom event for any listeners
			this.dispatchEvent(new CustomEvent('theme-changed', {
				detail: { themeName, variant },
				bubbles: true,
				composed: true
			}));
		} catch (error) {
			console.error('Failed to switch theme:', error);
		}
	}

	render() {
		if (!this._themes || Object.keys(this._themes).length === 0) {
			this.shadowRoot.innerHTML = '';
			return;
		}

		// Build options HTML
		let optionsHtml = '';
		Object.entries(this._themes).forEach(([themeName, themeData]) => {
			themeData.variants.forEach(variant => {
				const value = `${themeName}:${variant}`;
				const selected = (themeName === this._currentTheme && variant === this._currentVariant) ? 'selected' : '';
				const displayName = getDisplayName(themeName, variant);
				optionsHtml += `<option value="${value}" ${selected}>${displayName}</option>`;
			});
		});

		this.shadowRoot.innerHTML = `
			<style>
				:host {
					display: block;
					position: fixed;
					top: var(--theme-switcher-top, 16px);
					right: var(--theme-switcher-right, 16px);
					z-index: var(--theme-switcher-z-index, 10000);
				}

				.container {
					display: flex;
					align-items: center;
					gap: 8px;
					background: var(--theme-switcher-background, white);
					padding: 8px 12px;
					border-radius: var(--theme-switcher-border-radius, 6px);
					box-shadow: var(--theme-switcher-shadow, 0 2px 8px rgba(0, 0, 0, 0.1));
					font-family: var(--theme-switcher-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
					font-size: var(--theme-switcher-font-size, 14px);
				}

				label {
					font-weight: 500;
					color: var(--theme-switcher-label-color, #333);
					margin: 0;
				}

				select {
					padding: 6px 10px;
					border: 1px solid var(--theme-switcher-border-color, #ddd);
					border-radius: 4px;
					background: var(--theme-switcher-select-background, white);
					cursor: pointer;
					font-size: 14px;
					outline: none;
					color: var(--theme-switcher-text-color, #333);
				}

				select:hover {
					border-color: var(--theme-switcher-border-hover-color, #999);
				}

				select:focus {
					border-color: var(--theme-switcher-border-focus-color, #0066cc);
				}
			</style>

			<div class="container">
				<label>Theme:</label>
				<select>
					${optionsHtml}
				</select>
			</div>
		`;

		// Attach event listener
		const select = this.shadowRoot.querySelector('select');
		select.addEventListener('change', this.handleThemeChange.bind(this));
	}
}

// Register web component
customElements.define('theme-switcher', ThemeSwitcherElement);

/**
 * Wrapper function to automatically setup themes with minimal code
 *
 * @param {Object} preloadedThemes - Preloaded theme objects keyed by path
 * @param {Object|Function} optionsOrInitFn - Options object or init function
 * @param {Function} initFn - Initialization function (if options provided)
 * @returns {Promise<ServiceNowThemeLoader>} - Theme loader instance
 *
 * @example
 * // Simple usage
 * withThemes(preloadedThemes, async (loader) => {
 *   // Your app code here
 * });
 *
 * @example
 * // With options
 * withThemes(preloadedThemes, { defaultTheme: 'polaris', defaultVariant: 'dark' }, async (loader) => {
 *   // Your app code here
 * });
 */
export async function withThemes(preloadedThemes, optionsOrInitFn, initFn) {
	// Handle overloaded parameters
	let options = {};
	let callback = initFn;

	if (typeof optionsOrInitFn === 'function') {
		callback = optionsOrInitFn;
	} else {
		options = optionsOrInitFn || {};
	}

	// Parse theme structure
	const { themes } = parseThemeStructure(preloadedThemes);

	if (Object.keys(themes).length === 0) {
		console.warn('No themes detected in preloadedThemes');
		return null;
	}

	// Determine default theme and variant
	const themeNames = Object.keys(themes);
	const defaultTheme = options.defaultTheme || themeNames[0];
	const defaultVariant = options.defaultVariant ||
		(themes[defaultTheme].variants.includes('light') ? 'light' : themes[defaultTheme].variants[0]);

	if (!themes[defaultTheme]) {
		console.error(`Default theme '${defaultTheme}' not found in preloaded themes`);
		return null;
	}

	if (!themes[defaultTheme].variants.includes(defaultVariant)) {
		console.error(`Variant '${defaultVariant}' not found for theme '${defaultTheme}'`);
		return null;
	}

	// Create theme loader
	const loader = new ServiceNowThemeLoader({
		enableCache: options.enableCache !== false,
		preloadedThemes
	});

	// Load default theme
	try {
		console.log(`Loading default theme: ${defaultTheme} - ${defaultVariant}`);
		await loader.loadTheme(defaultTheme, defaultVariant);
		console.log('✓ Default theme loaded');
	} catch (error) {
		console.error('Failed to load default theme:', error);
		throw error;
	}

	// Create and inject theme switcher component
	if (options.showSwitcher !== false) {
		const switcher = document.createElement('theme-switcher');
		switcher.themes = themes;
		switcher.loader = loader;
		switcher.currentTheme = `${defaultTheme}:${defaultVariant}`;
		document.body.appendChild(switcher);

		console.log('✓ Theme switcher injected');
	}

	// Make loader globally accessible for debugging (optional)
	if (options.globalName) {
		window[options.globalName] = loader;
	} else if (options.debug !== false) {
		window.themeLoader = loader;
	}

	// Call user's initialization function
	if (callback) {
		await callback(loader);
	}

	return loader;
}

export default withThemes;
