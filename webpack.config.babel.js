import path from 'path';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import autoprefixer from 'autoprefixer';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';

// Setup Webpack + Babel (i.e. webpack.config.babel.js): https://medium.com/oredi/webpack-with-babel-7-b61f7caa9565
// TODO: split code, see https://webpack.js.org/guides/code-splitting/

export default (env, options) => {
    const devMode = options.mode !== 'production';

    return {
        entry: './src/js/index.js',
        output: {
            filename: 'bundle.[chunkhash].js',
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
                                includePaths: ['./node_modules'],
                            },
                        }
                    ],
                    // Next to sideEffects in package.json, add sideEffects here to include it in build.
                    // Reference: https://webpack.js.org/guides/tree-shaking/
                    sideEffects: true,
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
        devtool: devMode ? 'inline-source-map' : 'nosources-source-map',
        optimization: {
            minimizer: [
                new TerserPlugin({
                    cache: true,
                    parallel: true,
                    sourceMap: true, // Must be set to true if using source-maps in production
                    terserOptions: {
                        // https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
                        extractComments: 'all',
                    }
                }),
            ],
            mangleWasmImports: true,
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
            new CopyWebpackPlugin([
                { from: './node_modules/three/examples/js/libs/draco/gltf/', to:'assets/draco/gltf' }
            ]),
        ]
    };
};
