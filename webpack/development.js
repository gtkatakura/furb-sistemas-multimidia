const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlPlugin = require('html-webpack-plugin');
const merge = require('lodash/merge');

const { shared, loaders } = require('./common');

module.exports = merge(shared, {
  devtool: 'source-map',
  entry: [
    'react-hot-loader/patch',
    ...shared.entry,
  ],
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new ExtractTextPlugin({
      filename: 'styles.css',
    }),
    new HtmlPlugin(loaders.html),
  ],
  devServer: {
    host: 'localhost',
    port: 3000,
    historyApiFallback: true,
    hot: true,
    open: true,
    inline: true,
  },
});
