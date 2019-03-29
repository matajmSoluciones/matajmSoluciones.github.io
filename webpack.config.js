const path = require("path"),
    ExtractTextPlugin = require('extract-text-webpack-plugin'),
    extractCSS = new ExtractTextPlugin('style.css');


module.exports = {
    entry: {
        style: "./src/styles/main.sass"
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "main.js"
    },
    module: {
        rules: [
            {
                test: /\.(ttf|svg|woff)$/,
                loader: "url-loader"
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