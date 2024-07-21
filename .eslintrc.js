module.exports = {
  root: true,
  extends: ['@react-native', 'plugin:react-native/all', 'prettier'],
  plugins: ['react', 'react-native'],
  rules: {
    'react-native/no-inline-styles': 'off',
    'react/no-unknown-property': [
      'error',
      {
        ignore: ['className'],
        endOfLine: 'auto',
      },
    ],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
