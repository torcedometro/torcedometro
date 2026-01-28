module.exports = {
  root: true,
  extends: ['@react-native', 'prettier'],
  rules: {
    'prettier/prettier': 'error',
    'react-native/no-inline-styles': 'off',
    'react/react-in-jsx-scope': 'off', // Not needed in React 17+
  },
  plugins: ['prettier'],
  ignorePatterns: ['node_modules/', '.expo/', 'dist/', 'web-build/'],
};
