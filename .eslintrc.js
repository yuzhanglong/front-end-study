module.exports = {
  extends: [
    'plugin:@lint-md/recommend',
    'eslint:recommended'
  ],
  env: {
    node: true,
    browser: true,
    commonjs: true,
    amd: true,
    es6: true,
    jest: true
  },
  parserOptions: {
    ecmaVersion: 11
  },
  overrides: [
    {
      files: ['*.md'],
      parser: '@lint-md/eslint-plugin/src/parser',
      rules: {
        '@lint-md/no-long-code': [2, {
          'length': 1000,
          'exclude': []
        }]
      }
    }
  ]
}
