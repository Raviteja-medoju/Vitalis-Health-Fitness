// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = defineConfig([
  expoConfig,
  eslintPluginPrettierRecommended,
  {
    ignores: [
      'dist/*',
      'server/**',
      'coverage/*',
      '.expo/*',
      'src/design-system/tokens/generated.ts',
    ],
  },
  {
    rules: {
      // Reanimated shared values are mutated by contract (`sv.value = ...`) inside callbacks;
      // the React Compiler immutability rule flags them as false positives.
      'react-hooks/immutability': 'off',
      // Design-system governance: raw hex colors belong in tokens.json, not in components/screens.
      'no-restricted-syntax': [
        'warn',
        {
          selector: 'Literal[value=/^#(?:[0-9a-fA-F]{3}){1,2}$/]',
          message: 'Use a design token from useTheme() instead of a raw hex color.',
        },
      ],
    },
  },
  {
    files: [
      'src/design-system/tokens/**',
      'src/design-system/a11y/**',
      'scripts/**',
      'app.json',
      '**/*.test.ts',
      '**/*.test.tsx',
    ],
    rules: { 'no-restricted-syntax': 'off' },
  },
]);
