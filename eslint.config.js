const js = require('@eslint/js');
const nodePlugin = require('eslint-plugin-node');
const prettierConfig = require('eslint-config-prettier');

module.exports = [
  js.configs.recommended,
  prettierConfig,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'commonjs',
      globals: {
        process: 'readonly',
        __dirname: 'readonly',
        console: 'readonly',
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        Buffer: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        jest: 'readonly'
      }
    },
    plugins: {
      node: nodePlugin
    },
    rules: {
      ...nodePlugin.configs.recommended.rules,
      'node/no-unpublished-require': ['error', {
        allowModules: ['supertest']
      }],
      'node/no-unsupported-features/es-syntax': 'off'
    }
  },
  {
    ignores: ['node_modules/**', 'coverage/**', '.nyc_output/**']
  }
];