const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

module.exports = (async () => {
    const defaultConfig = await getDefaultConfig(__dirname);

    const customConfig = {
        resolver: {
            assetExts: defaultConfig.resolver.assetExts.filter(ext => ext !== 'svg'), // Remove SVG from asset extensions
            sourceExts: [...defaultConfig.resolver.sourceExts, 'svg', 'jsx', 'js', 'ts', 'tsx'], // Add SVG to source extensions
            extraNodeModules: {
                components: path.resolve(__dirname, 'src/components'),
                theme: path.resolve(__dirname, 'src/theme'),
                utils: path.resolve(__dirname, 'src/utils'),
                navigation: path.resolve(__dirname, 'src/navigation'),
                common: path.resolve(__dirname, 'src/common'),
                assets: path.resolve(__dirname, 'src/assets'),
                store: path.resolve(__dirname, 'src/store'),
                http: path.resolve(__dirname, 'src/http'),
                helpers: path.resolve(__dirname, 'src/helpers'),
                localization: path.resolve(__dirname, 'src/localization'),
            },
        },
        transformer: {
            babelTransformerPath: require.resolve('react-native-svg-transformer'),
            getTransformOptions: async () => ({
                transform: {
                    experimentalImportSupport: false,
                    inlineRequires: true,
                },
            }),
        },
    };

    return mergeConfig(defaultConfig, customConfig);
})();
