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
					'blue-dark': 'hsl(var(--admin-blue-dark))',
					green: 'hsl(var(--admin-green))',
					'green-light': 'hsl(var(--admin-green-light))',
					'green-dark': 'hsl(var(--admin-green-dark))',
					purple: 'hsl(var(--admin-purple))',
					'purple-light': 'hsl(var(--admin-purple-light))',
					'purple-dark': 'hsl(var(--admin-purple-dark))',
					orange: 'hsl(var(--admin-orange))',
					'orange-light': 'hsl(var(--admin-orange-light))',
					'orange-dark': 'hsl(var(--admin-orange-dark))',
					pink: 'hsl(var(--admin-pink))',
					'pink-light': 'hsl(var(--admin-pink-light))',
					'pink-dark': 'hsl(var(--admin-pink-dark))',
					yellow: 'hsl(var(--admin-yellow))',
					'yellow-light': 'hsl(var(--admin-yellow-light))',
					'yellow-dark': 'hsl(var(--admin-yellow-dark))',
					red: 'hsl(var(--admin-red))',
					'red-light': 'hsl(var(--admin-red-light))',
					'red-dark': 'hsl(var(--admin-red-dark))',
					indigo: 'hsl(var(--admin-indigo))',
					'indigo-light': 'hsl(var(--admin-indigo-light))',
					'indigo-dark': 'hsl(var(--admin-indigo-dark))',
					teal: 'hsl(var(--admin-teal))',
					'teal-light': 'hsl(var(--admin-teal-light))',
					'teal-dark': 'hsl(var(--admin-teal-dark))'
				},
				wp: {
					header: 'hsl(var(--wp-header))',
					'header-foreground': 'hsl(var(--wp-header-foreground))',
					sidebar: 'hsl(var(--wp-sidebar))',
					'sidebar-foreground': 'hsl(var(--wp-sidebar-foreground))',
					accent: 'hsl(var(--wp-accent))',
					'accent-hover': 'hsl(var(--wp-accent-hover))'
				},
				status: {
					success: 'hsl(var(--success))',
					'success-light': 'hsl(var(--success-light))',
					warning: 'hsl(var(--warning))',
					'warning-light': 'hsl(var(--warning-light))',
					error: 'hsl(var(--error))',
					'error-light': 'hsl(var(--error-light))',
					info: 'hsl(var(--info))',
					'info-light': 'hsl(var(--info-light))'
				},
				'success-button': {
					DEFAULT: 'hsl(var(--success-button))',
					foreground: 'hsl(var(--success-button-foreground))',
					light: 'hsl(var(--success-button-light))'
				},
				'info-badge': {
					DEFAULT: 'hsl(var(--info-badge))',
					foreground: 'hsl(var(--info-badge-foreground))',
					light: 'hsl(var(--info-badge-light))'
				}
			},
			fontFamily: {
				sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif'],
				serif: ['Playfair Display', 'ui-serif', 'Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],
				heading: ['Playfair Display', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0',
						opacity: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)',
						opacity: '1'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)',
						opacity: '1'
					},
					to: {
						height: '0',
						opacity: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'fade-out': {
					'0%': {
						opacity: '1',
						transform: 'translateY(0)'
					},
					'100%': {
						opacity: '0',
						transform: 'translateY(10px)'
					}
				},
				'slide-up': {
					'0%': {
						transform: 'translateY(30px)',
						opacity: '0'
					},
					'100%': {
						transform: 'translateY(0)',
						opacity: '1'
					}
				},
				'slide-down': {
					'0%': {
						transform: 'translateY(-30px)',
						opacity: '0'
					},
					'100%': {
						transform: 'translateY(0)',
						opacity: '1'
					}
				},
				'slide-in-right': {
					'0%': {
						transform: 'translateX(100%)',
						opacity: '0'
					},
					'100%': {
						transform: 'translateX(0)',
						opacity: '1'
					}
				},
				'slide-in-left': {
					'0%': {
						transform: 'translateX(-100%)',
						opacity: '0'
					},
					'100%': {
						transform: 'translateX(0)',
						opacity: '1'
					}
				},
				'scale-in': {
					'0%': {
						transform: 'scale(0.95)',
						opacity: '0'
					},
					'100%': {
						transform: 'scale(1)',
						opacity: '1'
					}
				},
				'scale-out': {
					'0%': {
						transform: 'scale(1)',
						opacity: '1'
					},
					'100%': {
						transform: 'scale(0.95)',
						opacity: '0'
					}
				},
				'bounce-in': {
					'0%': {
						transform: 'scale(0.3)',
						opacity: '0'
					},
					'50%': {
						transform: 'scale(1.1)',
						opacity: '0.8'
					},
					'100%': {
						transform: 'scale(1)',
						opacity: '1'
					}
				},
				'pulse-soft': {
					'0%, 100%': {
						opacity: '1'
					},
					'50%': {
						opacity: '0.7'
					}
				},
				'shake': {
					'0%, 100%': {
						transform: 'translateX(0)'
					},
					'10%, 30%, 50%, 70%, 90%': {
						transform: 'translateX(-2px)'
					},
					'20%, 40%, 60%, 80%': {
						transform: 'translateX(2px)'
					}
				},
				'glow': {
					'0%, 100%': {
						boxShadow: '0 0 5px hsl(var(--primary))'
					},
					'50%': {
						boxShadow: '0 0 20px hsl(var(--primary)), 0 0 30px hsl(var(--primary))'
					}
				},
				'confetti': {
					'0%': {
						transform: 'rotateZ(15deg) rotateY(0deg) translate(0,0)',
						opacity: '1'
					},
					'100%': {
						transform: 'rotateZ(15deg) rotateY(180deg) translate(-150px,200px)',
						opacity: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'fade-out': 'fade-out 0.3s ease-out',
				'slide-up': 'slide-up 0.3s ease-out',
				'slide-down': 'slide-down 0.3s ease-out',
				'slide-in-right': 'slide-in-right 0.3s ease-out',
				'slide-in-left': 'slide-in-left 0.3s ease-out',
				'scale-in': 'scale-in 0.2s ease-out',
				'scale-out': 'scale-out 0.2s ease-out',
				'bounce-in': 'bounce-in 0.5s ease-out',
				'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
				'shake': 'shake 0.5s ease-in-out',
				'glow': 'glow 2s ease-in-out infinite',
				'confetti': 'confetti 3s ease-out forwards'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
