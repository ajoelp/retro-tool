const path = require('path')

module.exports = {
  displayName: 'api',
  preset: '../../jest.preset.js',
  verbose: true,
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  testEnvironment: path.join(
    __dirname,
    './prisma-test-environment.ts'
  ),
  transform: {
    '^.+\\.[tj]s$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/api',
};
