module.exports = {
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  setupTestFrameworkScriptFile: './scripts/jestFix.js',
  testRegex: '\.(test|spec)\\.ts$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: ".coverage",
  coverageReporters: ['text', 'text-summary'],
  coverageThreshold: {
    global: { statements: 90, lines: 90, functions: 90 }
  },
  // reporters: ['jest-tap-reporter'],
  testPathIgnorePatterns: [
    '/build/',
    '/node_modules/'
  ]
}
