
import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
	darkMode: ["class"],
	content: [
		"./apps/web/**/*.{ts,tsx}",
		"./apps/web/pages/**/*.{ts,tsx}",
		"./apps/web/components/**/*.{ts,tsx}",
		"./index.html",
	],
	prefix: "",
	// Performance optimizations
	safelist: [
		// Critical classes that should never be purged
		'bg-background',
		'text-foreground',
		'border-border',
		'bg-primary',
		'text-primary-foreground',
	],
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// DevSecOps specific colors
				security: {
					critical: '#dc2626',
					high: '#ea580c',
					medium: '#d97706',
					low: '#65a30d',
					secure: '#059669',
					scanning: '#0891b2',
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'pulse-security': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.5' }
				},
				'scan-line': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(100%)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'pulse-security': 'pulse-security 2s ease-in-out infinite',
				'scan-line': 'scan-line 2s ease-in-out infinite'
			}
		}
	},
	plugins: [tailwindcssAnimate],
	// Performance optimizations
	corePlugins: {
		// Disable unused core plugins to reduce bundle size
		preflight: true,
		container: true,
		accessibility: false, // Disable if not needed
		appearance: false,
		backdropBlur: false,
		backdropBrightness: false,
		backdropContrast: false,
		backdropGrayscale: false,
		backdropHueRotate: false,
		backdropInvert: false,
		backdropOpacity: false,
		backdropSaturate: false,
		backdropSepia: false,
		// Keep only essential plugins
	},
} satisfies Config;
