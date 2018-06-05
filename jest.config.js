module.exports = {
  reporters: [
    'jest-tap-reporter',
  ],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  setupTestFrameworkScriptFile: './scripts/jestFix.js',
  testRegex: '\.(test|spec)\\.ts$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  testPathIgnorePatterns: [
    '/build/',
    '/node_modules/'
  ]
}
