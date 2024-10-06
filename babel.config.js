module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    'react-native-reanimated/plugin',
    [
      'module-resolver',
      {
        // root: ['./src'],
        // alias: {
        //   components: './components',
        //   '~': './',
        // },
        alias: {
          // '~': './src/',
          components: './src/components',
          theme: './src/theme',
          utils: './src/utils',
          navigation: './src/navigation',
          common: './src/common',
          assets: './src/assets',
          store: './src/store',
          http: './src/http',
          helpers: './helpers',
          localization: './src/localization',
        },
      },
    ],
  ],
};
