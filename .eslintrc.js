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
      },
      overrides: [
        {
          files: ['src/index.ts'],
          rules: {
            '@typescript-eslint/ban-ts-comment': 'off',
            '@typescript-eslint/no-unused-vars': 'off',
          },
        },
        {
          files: ['**/*.mock.ts', '**/*.spec.ts', '**/*.test.ts'],
          rules: {
            'node/no-unpublished-import': 'off',
            'node/no-extraneous-import': 'error',
            '@typescript-eslint/ban-ts-comment': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': 'off',
          },
        },
        {
          files: ['test/env.setup.js'],
          rules: {
            'node/no-extraneous-require': 'off',
          },
        },
      ],
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
