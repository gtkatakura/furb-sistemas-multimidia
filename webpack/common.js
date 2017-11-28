const ExtractTextPlugin = require('extract-text-webpack-plugin');

const paths = {
  root: `${__dirname}/..`,
  src: `${__dirname}/../src`,
  dist: `${__dirname}/../dist`,
};

module.exports = {
  paths,
  loaders: {
    html: {
      template: `${paths.src}/index.html`,
      filename: 'index.html',
      inject: 'body',
    },
  },
  shared: {
    entry: [
      'babel-polyfill',
      'normalize-css',
      `${paths.src}/index`,
    ],
    output: {
      path: paths.dist,
      filename: 'main.js',
    },
    module: {
      rules: [
        {
          test: /.js$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.(css|less)$/,
          use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: ['css-loader', 'less-loader'],
          }),
        },
      ],
    },
  },
};
