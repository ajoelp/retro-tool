module.exports = {
  displayName: 'client',
  preset: '../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nrwl/react/plugins/jest',
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageReporters: ['text-summary', ['lcov', { projectRoot: '../../' }]],
  coverageDirectory: '../../coverage/apps/client',
  setupFilesAfterEnv: ['<rootDir>/jest-setup.ts'],
};
