const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const autoprefixer = require('autoprefixer');

module.exports = (env, options) => {
    const devMode = options.mode !== 'production';

    return { entry: './src/index.js',
        output: {
            filename: 'bundle.[chunkhash].js',
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
                    use: [
                        {
                            loader: 'html-loader'
                        }
                    ]
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
                    test: /\.(jpe?g|png|gif|svg|ico)$/i,
                    use: {
                        loader: 'file-loader',
                        options: {
                            name: 'assets/[hash]-[name].[ext]',
                        }
                    }
                },
            ]
        },
        devServer: {
            open: true,
            overlay: true,
        },
        plugins: [
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
            })
        ]
    };
};