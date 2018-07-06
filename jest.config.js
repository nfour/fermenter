module.exports = {
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  verbose: true,
  setupTestFrameworkScriptFile: './scripts/jestFix.js',
  testRegex: '\.(test|spec)\\.ts$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: ".coverage",
  coverageReporters: ['text', 'text-summary'],
  coverageThreshold: {
    global: { statements: 90, lines: 90, functions: 90 }
  },
  testPathIgnorePatterns: [
    '/build/',
    '/node_modules/'
  ]
}
