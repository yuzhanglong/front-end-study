module.exports = {
  'extends': [
    'plugin:lint-md/recommend'
  ],
  overrides: [
    {
      files: ['*.md'],
      parser: 'eslint-plugin-lint-md/src/parser',
      rules: {
        'lint-md/no-long-code': [2, {
          'length': 1000,
          'exclude': []
        }]
      }
    }
  ]
}
