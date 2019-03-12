const path = require("path"),
    ExtractTextPlugin = require('extract-text-webpack-plugin'),
    extractCSS = new ExtractTextPlugin('style.css'),
    VueLoaderPlugin = require('vue-loader/lib/plugin'),
    Dotenv = require('dotenv-webpack');


module.exports = {
    entry: {
        main: [
            "./src/js/main.js",
            "./src/styles/_all.sass"
        ],
        pay: "./src/js/pay.js"
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "[name].js"
    },
    resolve: {
        alias: {
            vue: 'vue/dist/vue.js'
        },
    },
    module: {
        rules: [
            {
                test: /\.(woff2?|eot|ttf|otf|svg|jpeg|jpg|png|gif)(\?.*)?$/,
                loader: 'url-loader',
                options: { limit: 1000, name: 'fonts/[name].[ext]', },
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            },
            {
                test: /\.(sass|scss)$/,
                loader: ExtractTextPlugin.extract({
                    use: 'css-loader!sass-loader'
                })
            },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract({
                    use: 'style-loader!css-loader'
                })
            }
        ]
    },
    plugins: [
        extractCSS,
        new Dotenv(),
        new VueLoaderPlugin()
    ]
};