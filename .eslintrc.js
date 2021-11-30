module.exports = {
  extends: [
    'plugin:@lint-md/recommend',
    'plugin:@attachments/eslint-plugin/recommended',
  ],
  plugins: ['@attachments/eslint-plugin'],
  overrides: [
    {
      files: ['*.md'],
      parser: '@lint-md/eslint-plugin/lib/parser',
      rules: {
        '@lint-md/no-long-code': [
          2,
          {
            length: 1000,
            exclude: [],
          },
        ],
      },
    },
  ],
  ignorePatterns: ['./docs/old-docs'],
  root: true,
}
