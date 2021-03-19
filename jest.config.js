module.exports = {
  preset: 'ts-jest',
  testPathIgnorePatterns: [
    'docs',
    'website'
  ],
  testMatch: [
    "**/*.[jt]s?(x)"
  ]
}
