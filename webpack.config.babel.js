import path from 'path';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import FaviconsWebpackPlugin from 'favicons-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
// import ImageMinimizerPlugin from 'image-minimizer-webpack-plugin';

// Name 'webpack.config.babel.js' is for using ES6 in webpack config
export default (env, options) => {
    const devMode = options.mode !== 'production';

    return {
        entry: './src/js/index.js',
        target: 'web', // TODO: Check browserlist node support issue https://github.com/webpack/webpack/issues/11660 and https://github.com/webpack/webpack-dev-server/issues/2758
        output: {
            filename: devMode ? '[name].js' : '[name].[chunkhash].js',
            chunkFilename: devMode ? '[name].js' : '[name].[chunkhash].js',
            publicPath: '/',
            path: path.resolve(__dirname, 'build'),
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                    }
                },
                {
                    test: /\.scss$/,
                    exclude: /node_modules/,
                    use: [
                        devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
                        {
                            loader: 'css-loader',
                            options: { importLoaders: 1 },
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                postcssOptions: {
                                    plugins: ['autoprefixer'],
                                }
                            },
                        },
                        {
                            loader: 'sass-loader',
                            options: { // Configure sass-loader to understand the @material imports used by MDC Web
                                // Using Dart Sass
                                implementation: require('sass'),
                                sassOptions: {
                                    includePaths: ['./node_modules']
                                },
                            },
                        }
                    ],
                },
                { // Assets
                    test: /\.(jpe?g|png|gif|svg|ico)$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'file-loader',
                        options: {
                            name: devMode ? '[name].[ext]' : '[contenthash].[ext]',
                            outputPath: 'assets/img',
                        }
                    },
                },
                { // Models
                    test: /\.(obj|gltf|glb|drc|bin)$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'file-loader',
                        options: {
                            name: devMode ? '[name].[ext]' : '[contenthash].[ext]',
                            outputPath: 'assets',
                        }
                    }
                }
            ]
        },
        performance: {
            hints: 'warning',
        },
        stats: 'minimal',
        devServer: {
            open: true,
            overlay: true,
        },
        // To work with TerserPlugin: https://github.com/webpack-contrib/terser-webpack-plugin#note-about-source-maps
        devtool: devMode ? 'eval-source-map' : 'source-map',
        optimization: {
            minimize: true,
            minimizer: [
                new TerserPlugin({
                    terserOptions: {
                        output: {
                            comments: false,
                        },
                    },
                    extractComments: !devMode,
                }),
            ],
            splitChunks: {
                chunks: 'all',
                minSize: 0,
                cacheGroups: {
                    vendors: {
                        test: /[\\/]node_modules[\\/]((?!(three)).*)[\\/]/,
                        name: 'vendors',
                        chunks: 'all',
                    },
                    threeVendor: {
                        test: /[\\/]node_modules[\\/](three)[\\/]/,
                        name: 'three_vendor',
                        chunks: 'all',
                    },
                }
            },
            mangleWasmImports: true,
            // Reference: https://webpack.js.org/guides/tree-shaking/
            sideEffects: false,
        },
        plugins: [
            new CleanWebpackPlugin(),
            // HtmlWebpackPlugin must go before FaviconsWebpackPlugin
            // From https://github.com/jantimon/favicons-webpack-plugin#html-injection
            new HtmlWebpackPlugin({
                title: 'Sandbox',
                template: './src/index.html',
                githubLink: 'https://github.com/Abundle/dream-house-simulator',
                minify: {
                    removeComments: true,
                    collapseWhitespace: false,
                },
                meta: { // HTML meta tags
                    author: process.env.npm_package_author_name,
                    viewport: 'width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0',
                    theme_color: '#f15b27',
                }
            }),
            new FaviconsWebpackPlugin({
                logo: './logo.png',
                favicons: { // this plugin injects meta-tags from package.json unless they are explicitly set to null
                    appName: null,
                    appDescription: null,
                    developerName: null,
                    developerURL: null,
                    background: null,
                    theme_color: null,
                }
            }),
            new MiniCssExtractPlugin({
                filename: devMode ? '[name].css' : '[name].[chunkhash].css',
                chunkFilename: devMode ? '[id].css' : '[id].[chunkhash].css',
            }),
            new CopyWebpackPlugin({
                patterns: [ // Three.js DRACO loader docs: https://github.com/mrdoob/three.js/tree/dev/examples/js/libs/draco#readme
                    { from: './node_modules/three/examples/js/libs/draco/gltf/draco_decoder.wasm', to:'assets/draco/' },
                    { from: './node_modules/three/examples/js/libs/draco/gltf/draco_wasm_wrapper.js', to:'assets/draco/' },
                    { from: '.htaccess' },
                ]
            }),
            // TODO: use for images? https://github.com/webpack-contrib/image-minimizer-webpack-plugin
            /*new ImageMinimizerPlugin({
                minimizerOptions: {
                    plugins: [
                        ['gifsicle', { interlaced: true, optimizationLevel: 3 }],
                    ],
                },
            }),*/
        ]
    };
};
