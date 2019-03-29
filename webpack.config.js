const path = require("path"),
    ExtractTextPlugin = require('extract-text-webpack-plugin'),
    extractCSS = new ExtractTextPlugin('style.css');


module.exports = {
    entry: {
        style: "./src/styles/_all.sass"
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "main.js"
    },
    module: {
        rules: [
            {
                test: /\.(woff2?|eot|ttf|otf|svg|jpeg|jpg|png|gif)(\?.*)?$/,
                loader: 'url-loader',
                options: { limit: 1000, name: 'fonts/[name].[ext]', },
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
        extractCSS
    ]
};