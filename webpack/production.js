const webpack = require('webpack');
const CleanPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlPlugin = require('html-webpack-plugin');
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
const merge = require('lodash/merge');

const { shared, paths, loaders } = require('./common');

module.exports = merge(shared, {
  output: {
    filename: '[name]-[hash].js',
  },
  plugins: [
    new CleanPlugin(['dist'], {
      root: paths.root,
    }),
    new ExtractTextPlugin({
      filename: 'styles-[hash].css',
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
      },
    }),
    new HtmlPlugin(merge(loaders.html, {
      minify: { collapseWhitespace: true },
    })),
    new LodashModuleReplacementPlugin(),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
    }),
  ],
});
