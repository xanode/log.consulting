/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				blue: {
					log: '#71cee2',
				},
				green: {
					log: '#61bda5',
				},
				red: {
					log: '#e94266',
				},
				yellow: {
					log: '#fff042',
				},
				gray: {
					log: '#ededed',
				}
			},
			maxWidth: {
				'8xl': '90rem',
			},
			minWidth: {
				'xl': '36rem',
			}
		},
	},
	plugins: [
		require('@tailwindcss/typography'),
	],
}
