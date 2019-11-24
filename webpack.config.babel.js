import path from 'path';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import autoprefixer from 'autoprefixer';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';

// Name "webpack.config.babel.js' is for using ES6 in webpack config

// TODO: check lazy loading https://webpack.js.org/guides/code-splitting/

export default (_, options) => {
    const devMode = options.mode !== 'production';

    return {
        entry: {
            main: './src/js/index.js'
        },
        output: {
            filename: devMode ? 'main.js' : 'main.[chunkhash].js',
            chunkFilename: devMode ? '[name].js' : '[name].[chunkhash].js',
            publicPath: '/',
            path: path.resolve(__dirname, 'build')
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
                    test: /\.html$/,
                    use: {
                        loader: 'html-loader',
                        options: {
                            interpolate: true,
                            minimize: true,
                            removeComments: true
                        }
                    }
                },
                {
                    test: /\.s(a|c)ss$/,
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
                                sassOptions: {
                                    includePaths: ['./node_modules'],
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
                new TerserPlugin({ // Docs: https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
                    extractComments: 'all',
                    // sourceMap: true, // Must be set to true if using source-maps in production
                }),
            ],
            // Setup from https://medium.com/hackernoon/the-100-correct-way-to-split-your-chunks-with-webpack-f8a9df5b7758
            // & https://medium.com/@Yoriiis/the-real-power-of-webpack-4-splitchunks-plugin-fad097c45ba0
            splitChunks: {
                chunks: 'all',
                minSize: 0,
                cacheGroups: {
                    vendors: {
                        test: /[\\/]node_modules[\\/]/,
                        name: devMode,
                        /*name(module) {
                            // get the name. E.g. node_modules/packageName/not/this/part.js or node_modules/packageName
                            const packageName = module.context.match(/[\\/]node_modules[\\/](?:(@[\w-]*?[\\/].*?|.*?)([\\/]|$))/)[1];
                            // npm package names are URL-safe, but some servers don't like @ symbols
                            return `npm.${ packageName.replace('@', '') }`;
                        },*/
                    },
                }
            },
            mangleWasmImports: true,
            // Reference: https://webpack.js.org/guides/tree-shaking/
            sideEffects: false,
        },
        plugins: [
            new CleanWebpackPlugin(),
            new HtmlWebpackPlugin({
                template: './src/index.html',
                filename: './index.html',
                minify: {
                    removeComments: true,
                    collapseWhitespace: false
                },
                favicon: './favicon.ico'
            }),
            new MiniCssExtractPlugin({
                filename: devMode ? '[name].css' : '[name].[hash].css',
                chunkFilename: devMode ? '[id].css' : '[id].[hash].css'
            }),
            new CopyWebpackPlugin([ // Three.js DRACO loader docs: https://github.com/mrdoob/three.js/tree/dev/examples/js/libs/draco#readme
                // { from: './node_modules/three/examples/js/libs/draco/gltf/draco_decoder.js', to:'assets/draco/' },
                { from: './node_modules/three/examples/js/libs/draco/gltf/draco_decoder.wasm', to:'assets/draco/' },
                { from: './node_modules/three/examples/js/libs/draco/gltf/draco_wasm_wrapper.js', to:'assets/draco/' }
            ]),
        ]
    };
};
