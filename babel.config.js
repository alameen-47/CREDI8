module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ['nativewind/babel'],
    ['import', {libraryName: '@ant-design/react-native'}],
  ],
};
