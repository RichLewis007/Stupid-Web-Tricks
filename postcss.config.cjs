module.exports = {
  plugins: [require('@tailwindcss/postcss'), require('./postcss-remove-webkit.cjs')],
};
