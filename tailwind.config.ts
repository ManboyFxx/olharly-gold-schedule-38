
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
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
				// Olharly Brand Colors
				gold: {
					DEFAULT: '#E6B800',
					50: '#FFFDF0',
					100: '#FEF9E1',
					200: '#FDF2C3',
					300: '#FBEBA4',
					400: '#F8E486',
					500: '#E6B800',
					600: '#CC9F00',
					700: '#B38600',
					800: '#996D00',
					900: '#805400'
				},
				warm: {
					DEFAULT: '#FDFCFB',
					50: '#FDFCFB',
					100: '#FAF8F5',
					200: '#F5F2ED',
					300: '#F0ECE5',
					400: '#EBE6DD',
					500: '#E8E4E0'
				},
				earth: {
					DEFAULT: '#2A2621',
					50: '#F7F6F5',
					100: '#EFEDEA',
					200: '#DFDBD5',
					300: '#CFC9C0',
					400: '#BFB7AB',
					500: '#AFA596',
					600: '#9F9381',
					700: '#8B7F6C',
					800: '#5D5651',
					900: '#2A2621'
				},
				// System colors mapped to brand
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
				}
			},
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif'],
				display: ['Inter', 'system-ui', 'sans-serif']
			},
			fontSize: {
				'display-2xl': ['4.5rem', { lineHeight: '1.1', fontWeight: '700' }],
				'display-xl': ['3.75rem', { lineHeight: '1.1', fontWeight: '700' }],
				'display-lg': ['3rem', { lineHeight: '1.2', fontWeight: '600' }],
				'display-md': ['2.25rem', { lineHeight: '1.25', fontWeight: '600' }],
				'display-sm': ['1.875rem', { lineHeight: '1.3', fontWeight: '600' }]
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'slide-up': {
					'0%': { opacity: '0', transform: 'translateY(20px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'scale-in': {
					'0%': { opacity: '0', transform: 'scale(0.95)' },
					'100%': { opacity: '1', transform: 'scale(1)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.5s ease-out',
				'slide-up': 'slide-up 0.6s ease-out',
				'scale-in': 'scale-in 0.3s ease-out'
			},
			boxShadow: {
				'soft': '0 2px 8px rgba(42, 38, 33, 0.04)',
				'medium': '0 4px 16px rgba(42, 38, 33, 0.08)',
				'large': '0 8px 32px rgba(42, 38, 33, 0.12)',
				'gold': '0 4px 16px rgba(230, 184, 0, 0.15)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
