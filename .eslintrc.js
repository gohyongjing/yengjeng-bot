/** @type {import('eslint').Linter.Config} */
const eslintConfig = {
  extends: [
    'eslint:recommended',
    './node_modules/gts/',
    'plugin:jest/recommended',
    'plugin:jest/style',
    'plugin:prettier/recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  overrides: [
    {
      parser: '@typescript-eslint/parser',
      files: ['*.ts'],
      extends: ['plugin:@typescript-eslint/recommended'],
      parserOptions: {
        project: ['./tsconfig.json'],
      },
      rules: {
        '@typescript-eslint/switch-exhaustiveness-check': 'error',
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
            caughtErrorsIgnorePattern: '^_',
          },
        ],
        'prettier/prettier': 'off',
      },
    },
    {
      files: ['*.config.js'],
      rules: {
        'node/no-unpublished-require': 'off',
      },
    },
  ],
};

module.exports = {
  ...eslintConfig,
};
