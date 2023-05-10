const plugin = require('tailwindcss/plugin');

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{astro,html,md,ts}'],
	theme: {
		extend: {
			borderRadius: {
				'4xl': '2.25rem',
				'5xl': '3rem',
			},
			borderWidth: {
				'3': '3px',
			},
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
					dark: '#ababab',
					log: '#ededed',
				}
			},
			flexBasis: {
				'3/8': '37.5%',
			},
			maxWidth: {
				'8xl': '90rem',
			},
			minWidth: {
				'xl': '36rem',
			},
			spacing: {
				'screen-1/3': '33.333333vw',
				'screen-2/3': '66.666667vw',
				'screen-1/4': '25vw',
				'screen-1/2': '50vw',
				'screen-1/24': '4.166667vw',
				'screen-1/6': '16.666667vw',
				'screen-3/40': '7.5vw',
				'screen-1/5': '20vw',
			},
			width: {
				'112': '28rem',
			}
		},
	},
	plugins: [
		plugin(function ({ addVariant }) {
			addVariant('title-svg', '&>*>svg')
		}),
		require('@tailwindcss/typography'),
	],
	safelist: [
		{
			pattern: /grid-cols-\d+/,
			variants: ['sm', 'md', 'lg', 'xl', '2xl'],
		}
	]
};
