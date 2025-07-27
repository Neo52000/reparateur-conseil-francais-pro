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
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--electric-blue))',
					foreground: 'hsl(var(--electric-blue-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				'electric-blue': {
					DEFAULT: 'hsl(var(--electric-blue))',
					foreground: 'hsl(var(--electric-blue-foreground))',
					light: 'hsl(var(--electric-blue-light))',
					dark: 'hsl(var(--electric-blue-dark))'
				},
				'vibrant-orange': {
					DEFAULT: 'hsl(var(--vibrant-orange))',
					foreground: 'hsl(var(--vibrant-orange-foreground))',
					light: 'hsl(var(--vibrant-orange-light))',
					dark: 'hsl(var(--vibrant-orange-dark))'
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
				admin: {
					blue: 'hsl(var(--admin-blue))',
					'blue-light': 'hsl(var(--admin-blue-light))',
					green: 'hsl(var(--admin-green))',
					'green-light': 'hsl(var(--admin-green-light))',
					purple: 'hsl(var(--admin-purple))',
					'purple-light': 'hsl(var(--admin-purple-light))',
					orange: 'hsl(var(--admin-orange))',
					'orange-light': 'hsl(var(--admin-orange-light))',
					pink: 'hsl(var(--admin-pink))',
					'pink-light': 'hsl(var(--admin-pink-light))',
					yellow: 'hsl(var(--admin-yellow))',
					'yellow-light': 'hsl(var(--admin-yellow-light))'
				}
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
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
