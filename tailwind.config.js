const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  purge: ['./apps/client/**/*.{js,jsx,ts,tsx,vue,html}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  variants: {
    extend: {
      visibility: ['hover', 'focus', 'group-hover'],
      display: ['hover', 'focus', 'group-hover'],
    },
  },
  plugins: [require('@tailwindcss/forms'), require('tailwind-scrollbar')],
};
