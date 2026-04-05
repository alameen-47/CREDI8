module.exports = function (api) {
  api.cache.using(() => process.env.BABEL_ENV || process.env.NODE_ENV || 'development');
  const isProd = api.env('production');
  return {
    presets: ['module:@react-native/babel-preset'],
    plugins: [
      ['nativewind/babel'],
      ['import', {libraryName: '@ant-design/react-native'}],
      ...(isProd
        ? [['transform-remove-console', {exclude: ['error']}]]
        : []),
    ],
  };
};
