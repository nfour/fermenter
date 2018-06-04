module.exports = {
  testRunner: '@temando/jest-instrumented-runner',
  reporters: [
    'jest-tap-reporter',
    [
      '@temando/jest-reporter',
      {
        testServerUrl: 'https://staging.qa.temando.io',
      },
    ],
  ],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testRegex: '\.(test|spec)\\.ts$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  testPathIgnorePatterns: [
    '/build/',
    '/node_modules/'
  ]
}
