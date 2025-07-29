module.exports = {
  preset: "ts-jest",
  transform: {
    "\\.[jt]sx?$": "babel-jest"
  },
  testEnvironment: 'node',
  transformIgnorePatterns: [
    'node_modules/(?!(.pnpm/jose@.*|jose)/)'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
};