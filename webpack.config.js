const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const autoprefixer = require('autoprefixer');
const CopyWebpackPlugin = require('copy-webpack-plugin');

// TODO: use import here instead of require?
// TODO: check minify/uglify plugins? (if babel doesn't do this already) e.g. https://github.com/webpack-contrib/terser-webpack-plugin

module.exports = (env, options) => {
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
                    exclude: /(node_modules)/,
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
                            options: {
                                includePaths: ['./node_modules'],
                            },
                        }
                    ]
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
                /*{
                    test: /\.(obj|gltf|glb|drc)$/,
                    loader: 'url-loader',
                },*/
            ]
        },
        resolve: { // Setup from https://gist.github.com/cecilemuller/0be98dcbb0c7efff64762919ca486a59
            alias: {
                // 'assets': path.resolve('src/assets/img'),
                three$: 'three/build/three.min.js',
                'three/.*$': 'three',
                /*'three/vendor': path.join(__dirname, 'node_modules/three/examples/js/vendor/stats.min.js'),
                'three/OrbitControls': path.join(__dirname, 'node_modules/three/examples/js/controls/OrbitControls.js'),
                'three/DRACOLoader': path.join(__dirname, 'node_modules/three/examples/js/loaders/DRACOLoader.js'),
                'three/DRACOLoader/DecoderPath': path.join(__dirname, 'node_modules/three/examples/js/vendor/draco/gltf/'),
                'three/GLTFLoader': path.join(__dirname, 'node_modules/three/examples/js/loaders/GLTFLoader.js')*/
            }
        },
        devServer: {
            open: true,
            overlay: true,
        },
        plugins: [
            new webpack.ProvidePlugin({
                THREE: 'three'
            }),
            new CleanWebpackPlugin(),
            new HtmlWebpackPlugin({
                template: './src/index.html',
                filename: './index.html',
                minify: {
                    removeComments: true,
                    collapseWhitespace: false
                }
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
