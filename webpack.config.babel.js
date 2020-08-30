import path from 'path';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import FaviconsWebpackPlugin from 'favicons-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import autoprefixer from 'autoprefixer';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';

// Name 'webpack.config.babel.js' is for using ES6 in webpack config

export default (env, options) => {
    const devMode = options.mode !== 'production';

    return {
        entry: {
            main: './src/js/index.js'
        },
        output: {
            filename: devMode ? 'main.js' : 'main.[chunkhash].js',
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
                    use: [
                        devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
                        { loader: 'css-loader' },
                        { loader: 'postcss-loader',
                            options: {
                                plugins: () => [autoprefixer()],
                            },
                        },
                        {
                            loader: 'sass-loader',
                            options: { // Configure sass-loader to understand the @material imports used by MDC Web
                                // Prefer Dart Sass
                                implementation: require('sass'),

                                // See https://github.com/webpack-contrib/sass-loader/issues/804
                                webpackImporter: false,
                                sassOptions: {
                                    includePaths: ['./node_modules']
                                },
                            },
                        }
                    ],
                },
                {
                    test: /\.(jpe?g|png|gif|svg|ico)$/,
                    use: {
                        loader: 'file-loader',
                        options: {
                            name: devMode ? 'assets/img/[name].[ext]' : 'assets/img/[hash].[ext]',
                        }
                    }
                },
                {
                    test: /\.(obj|gltf|glb|drc|bin)$/,
                    use: {
                        loader: 'file-loader',
                        options: {
                            name: devMode ? 'assets/[name].[ext]' : 'assets/[hash].[ext]',
                        }
                    }
                },
            ]
        },
        devServer: {
            open: true,
            overlay: true,
        },
        devtool: devMode ? 'eval-source-map' : false,
        optimization: {
            minimizer: [
                new TerserPlugin({
                    terserOptions: {
                        output: {
                            comments: false,
                        },
                    },
                    extractComments: false,
                }),
            ],
            // Inspiration from:
            // - https://medium.com/hackernoon/the-100-correct-way-to-split-your-chunks-with-webpack-f8a9df5b7758
            // - https://medium.com/@Yoriiis/the-real-power-of-webpack-4-splitchunks-plugin-fad097c45ba0
            // - https://stackoverflow.com/questions/48985780/webpack-4-create-vendor-chunk
            splitChunks: {
                chunks: 'all',
                minSize: 0,
                cacheGroups: {
                    vendor: {
                        test: /[\\/]node_modules[\\/](!three)[\\/]/,
                        name: devMode,
                    },
                    three_vendor: {
                        test: /[\\/]node_modules[\\/](three)[\\/]/,
                        name: devMode,
                    },
                }
            },
            mangleWasmImports: true,
            // Reference: https://webpack.js.org/guides/tree-shaking/
            sideEffects: false,
        },
        plugins: [
            new CleanWebpackPlugin(),
            new HtmlWebpackPlugin({ // HtmlWebpackPlugin must go before FaviconsWebpackPlugin
                template: './src/index.html',
                minify: {
                    removeComments: true,
                    collapseWhitespace: false,
                },
                meta: { // HTML meta tags
                    charset: 'UTF-8',
                    author: process.env.npm_package_author_name,
                    'theme-color': '#f15b27',
                    viewport: 'width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0'
                }
            }),
            new MiniCssExtractPlugin({
                filename: devMode ? '[name].css' : '[name].[hash].css',
                chunkFilename: devMode ? '[id].css' : '[id].[hash].css',
            }),
            new CopyWebpackPlugin({
                patterns: [ // Three.js DRACO loader docs: https://github.com/mrdoob/three.js/tree/dev/examples/js/libs/draco#readme
                    // { from: './node_modules/three/examples/js/libs/draco/gltf/draco_decoder.js', to:'assets/draco/' },
                    { from: './node_modules/three/examples/js/libs/draco/gltf/draco_decoder.wasm', to:'assets/draco/' },
                    { from: './node_modules/three/examples/js/libs/draco/gltf/draco_wasm_wrapper.js', to:'assets/draco/' },
                    { from: '.htaccess' },
                ]
            }),
            new FaviconsWebpackPlugin(),
        ]
    };
};
