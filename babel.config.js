module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    'react-native-reanimated/plugin',
    ['@babel/plugin-transform-class-properties', { loose: true }],
    ['@babel/plugin-transform-private-methods', { loose: true }],
    ['@babel/plugin-transform-private-property-in-object', { loose: true }],
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
