/**
 * ThemeParser - Parse ServiceNow theme JSON into CSS custom properties
 *
 * Handles the conversion of ServiceNow theme files (colors.json, dark.json, etc.)
 * into CSS custom property declarations that can be injected into the DOM.
 */

export class ThemeParser {
	constructor() {
		this.resolvedVars = new Map();
	}

	/**
	 * Generate color scale variants from a base color
	 * ServiceNow uses different scales:
	 * - 4-point scale (0-3): index 1 is the base color
	 * - 22-point scale (0-21): 0=white, 21=black, gradual interpolation
	 *
	 * @param {String} baseColor - RGB string like "61,74,80"
	 * @param {Number} points - Number of points: 4 or 22 (default 4)
	 * @returns {Array} Array of RGB strings
	 */
	generateColorScale(baseColor, points = 4) {
		const [r, g, b] = baseColor.split(',').map(Number);
		const scale = [];

		if (points === 4) {
			// 4-point scale: 0=lightest, 1=base, 2=darker, 3=darkest
			// Index 1 is the exact base color

			// Index 0: Lightest tint (add 25% white)
			const tint = 0.25;
			scale.push(`${Math.round(r + (255 - r) * tint)},${Math.round(g + (255 - g) * tint)},${Math.round(b + (255 - b) * tint)}`);

			// Index 1: Base color (exact input)
			scale.push(`${r},${g},${b}`);

			// Index 2: Darker shade (reduce by 20%)
			const shade2 = 0.80;
			scale.push(`${Math.round(r * shade2)},${Math.round(g * shade2)},${Math.round(b * shade2)}`);

			// Index 3: Darkest shade (reduce by 35%)
			const shade3 = 0.65;
			scale.push(`${Math.round(r * shade3)},${Math.round(g * shade3)},${Math.round(b * shade3)}`);

		} else {
			// 22-point scale (neutral colors): 0=white, 21=black
			for (let i = 0; i < points; i++) {
				const t = i / (points - 1); // 0 to 1
				let newR, newG, newB;

				if (i === 0) {
					// Pure white
					newR = newG = newB = 255;
				} else if (i === points - 1) {
					// Pure black
					newR = newG = newB = 0;
				} else {
					// Interpolate from white to black
					const midPoint = 0.5;
					if (t < midPoint) {
						// Interpolate from white to base color
						const factor = t / midPoint;
						newR = Math.round(255 + (r - 255) * factor);
						newG = Math.round(255 + (g - 255) * factor);
						newB = Math.round(255 + (b - 255) * factor);
					} else {
						// Interpolate from base color to black
						const factor = (t - midPoint) / (1 - midPoint);
						newR = Math.round(r * (1 - factor));
						newG = Math.round(g * (1 - factor));
						newB = Math.round(b * (1 - factor));
					}
				}

				scale.push(`${newR},${newG},${newB}`);
			}
		}

		return scale;
	}

	/**
	 * Parse theme object into CSS text
	 * @param {Object} themeData - Theme JSON with base and properties
	 * @returns {String} CSS text with :root { ... }
	 */
	parse(themeData) {
		this.resolvedVars.clear();
		const cssVars = [];

		// Process base colors first (these are RGB values without rgb() wrapper)
		if (themeData.base) {
			Object.entries(themeData.base).forEach(([key, value]) => {
				// Skip non-color properties like isDark
				if (key === 'isDark') return;

				cssVars.push(`  ${key}: ${value};`);
				this.resolvedVars.set(key, value);
			});
		}

		// Process properties with reference resolution
		if (themeData.properties) {
			Object.entries(themeData.properties).forEach(([key, value]) => {
				const resolvedValue = this.resolveValue(value);
				cssVars.push(`  ${key}: ${resolvedValue};`);
			});
		}

		return `:root {\n${cssVars.join('\n')}\n}`;
	}

	/**
	 * Resolve property value (handle CSS variable references)
	 * @param {*} value - Property value (string, number, etc.)
	 * @returns {String} Resolved CSS value
	 */
	resolveValue(value) {
		if (typeof value !== 'string') {
			return value;
		}

		// If it's a CSS variable reference (--now-*, --uib-*, etc.)
		if (value.startsWith('--')) {
			return `var(${value})`;
		}

		return value;
	}

	/**
	 * Merge multiple theme objects and generate color scales
	 * Later themes override earlier themes (similar to Object.assign)
	 * @param {Array<Object>} themes - Array of theme objects
	 * @returns {Object} Merged theme object with generated scales
	 */
	merge(themes) {
		const merged = { base: {}, properties: {} };

		themes.forEach(theme => {
			if (theme.base) {
				Object.assign(merged.base, theme.base);
			}
			if (theme.properties) {
				Object.assign(merged.properties, theme.properties);
			}
		});

		// Generate color scales from base colors
		this.generateScales(merged);

		return merged;
	}

	/**
	 * Generate color scale variants
	 * - Neutral colors: 22-point scale (0-21)
	 * - Other colors: 4-point scale (0-3) where index 1 = base color
	 * @param {Object} themeData - Theme object to enhance with scales
	 */
	generateScales(themeData) {
		if (!themeData.base) return;

		// Neutral uses 22-point scale (0=white, 21=black)
		const neutralColors = ['--now-color--neutral'];

		// All other colors use 4-point scale (0=lightest, 1=base, 2=darker, 3=darkest)
		const fourPointColors = [
			'--now-color--primary',
			'--now-color--secondary',
			'--now-color_selection--primary',
			'--now-color_selection--secondary',
			'--now-color--interactive',
			'--now-color--link',
			'--now-color--focus',
			'--now-color_alert--critical',
			'--now-color_alert--high',
			'--now-color_alert--warning',
			'--now-color_alert--moderate',
			'--now-color_alert--info',
			'--now-color_alert--positive',
			'--now-color_alert--low'
		];

		let generatedCount = 0;

		// Generate 22-point scale for neutral
		neutralColors.forEach(colorName => {
			const baseValue = themeData.base[colorName];
			if (baseValue && typeof baseValue === 'string') {
				const scale = this.generateColorScale(baseValue, 22);
				scale.forEach((value, index) => {
					themeData.base[`${colorName}-${index}`] = value;
					generatedCount++;
				});
			}
		});

		// Generate 4-point scale for other colors
		fourPointColors.forEach(colorName => {
			const baseValue = themeData.base[colorName];
			if (baseValue && typeof baseValue === 'string') {
				const scale = this.generateColorScale(baseValue, 4);
				scale.forEach((value, index) => {
					themeData.base[`${colorName}-${index}`] = value;
					generatedCount++;
				});
			}
		});

		console.log(`Generated ${generatedCount} color scale variants (neutral: 22-point, others: 4-point)`);
	}

	/**
	 * Validate theme structure
	 * @param {Object} themeData - Theme object to validate
	 * @returns {Object} Validation result { valid: boolean, errors: Array }
	 */
	validate(themeData) {
		const errors = [];

		if (!themeData || typeof themeData !== 'object') {
			errors.push('Theme data must be an object');
			return { valid: false, errors };
		}

		// Check if at least one section exists
		if (!themeData.base && !themeData.properties) {
			errors.push('Theme must have either "base" or "properties" section');
		}

		// Validate base colors format
		if (themeData.base) {
			Object.entries(themeData.base).forEach(([key, value]) => {
				if (!key.startsWith('--') && key !== 'isDark') {
					errors.push(`Base key "${key}" should start with --`);
				}
			});
		}

		// Validate properties
		if (themeData.properties) {
			Object.entries(themeData.properties).forEach(([key, value]) => {
				if (!key.startsWith('--')) {
					errors.push(`Property key "${key}" should start with --`);
				}
			});
		}

		return {
			valid: errors.length === 0,
			errors
		};
	}
}
