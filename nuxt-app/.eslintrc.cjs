module.exports = {
  // Basic eslint setup for Nuxt 3
  // Reference: https://dev.to/tao/adding-eslint-and-prettier-to-nuxt-3-2023-5bg
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
  },
  extends: ['@nuxtjs/eslint-config-typescript', 'plugin:prettier/recommended'],
  // Custom eslint config
  ignorePatterns: ['*.cjs'],
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2020,
  },
  rules: {
    // Formatting options (extends prettier)
    'prettier/prettier': 'warn',
    'no-multiple-empty-lines': 'warn',
    'camelcase': ['error', { properties: 'never' }],
    'brace-style': ['error', '1tbs', { allowSingleLine: true }],
    // Code-style options
    'no-use-before-define': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
    'prefer-const': [
      'error',
      {
        destructuring: 'all',
        ignoreReadBeforeAssign: false,
      },
    ],
    'eqeqeq': [
      'error',
      'always',
      {
        null: 'ignore',
      },
    ],
    'no-console': 'warn',
  },
}
