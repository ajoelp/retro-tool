/* eslint-disable */
const path = require('path');

export default {
  displayName: 'api',
  preset: '../../jest.preset.js',
  verbose: true,
  clearMocks: true,
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  testEnvironment: path.join(__dirname, './prisma-test-environment.ts'),
  transform: {
    '^.+\\.[tj]s$': 'ts-jest',
  },
  setupFilesAfterEnv: ['./jest.setup.ts'],
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/api',
  coverageReporters: ['text-summary', ['lcov', { projectRoot: '../../' }]],
};
