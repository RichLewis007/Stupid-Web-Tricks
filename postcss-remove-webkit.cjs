/**
 * PostCSS plugin to strip WebKit-only declarations/selectors that trigger console noise
 * in non-WebKit browsers (e.g., -webkit-text-size-adjust, ::-webkit-scrollbar).
 */
module.exports = () => ({
  postcssPlugin: 'remove-webkit-warnings',
  Declaration(decl) {
    if (decl.prop === '-webkit-text-size-adjust') {
      decl.remove();
    }
  },
  Rule(rule) {
    if (rule.selector && rule.selector.includes('::-webkit-scrollbar')) {
      rule.remove();
    }
  },
});
module.exports.postcss = true;
