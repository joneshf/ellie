const path = require("path")
const webpack = require('webpack')
const StringReplacePlugin = require('string-replace-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const ManifestPlugin = require('webpack-manifest-plugin')

const generatedElmCss = path.resolve(__dirname, 'client/elm-stuff/generated-code/rtfeldman/elm-css/output.css')

module.exports = {
  cache: true,
  target: 'web',

  externals: {
    'fs': '__fileSystem'
  },

  entry: {
    editor: ['es6-promise', generatedElmCss, path.join(__dirname, 'client/src/Pages/Editor/index.js')],
    embed: ['es6-promise', generatedElmCss, path.join(__dirname, 'client/src/Pages/Embed/index.js')],
  },

  output: {
    path: path.resolve(__dirname + '/build'),
    filename: '[name].[chunkhash:8].js',
    chunkFilename: 'chunk.[name].[chunkhash:8].js',
    publicPath: process.env.CDN_BASE + '/assets/'
  },

  resolve: {
    alias: {
      'Make/0.18.0$': path.resolve(__dirname, 'make/0.18.0/build/bundle.js')
    }
  },

  module: {
    rules: [
      {
        test: /\.svg$/,
        use: {
          loader: 'svg-inline-loader'
        }
      },
      {
        test: /\.js$/,
        exclude: /(node_modules|make)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['es2017'],
              ['env', { 'targets': { 'uglify': true } }]
            ],
            plugins: ['syntax-dynamic-import']
          }
        }
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader!postcss-loader'
        })
      },
      { test: /\.json$/,
        loader: 'json-loader'
      },
      {
        test:    /Main\.elm$/,
        exclude: [/elm-stuff/, /node_modules/],
        loaders:  [
          StringReplacePlugin.replace({
            replacements: [
              { pattern: /\%CDN_BASE\%/g, replacement: () => process.env.CDN_BASE },
              { pattern: /\%SERVER_ORIGIN\%/g, replacement: () => process.env.SERVER_HOSTNAME },
              { pattern: /\%CARBON_ZONE_ID\%/g, replacement: () => process.env.CARBON_ZONE_ID },
              { pattern: /\%CARBON_SERVE\%/g, replacement: () => process.env.CARBON_SERVE },
              { pattern: /\%CARBON_PLACEMENT\%/g, replacement: () => process.env.CARBON_PLACEMENT },
              { pattern: /\%ENV\%/g, replacement: () => process.env.ENV },
            ]
          }),
          `elm-webpack-loader?yes&cwd=${path.join(__dirname, 'client')}`,
        ]
      },
    ]
  },

  plugins: [
    new webpack.HashedModuleIdsPlugin(),
    new webpack.DefinePlugin({
      SERVER_ORIGIN: JSON.stringify(process.env.SERVER_HOSTNAME),
      CDN_BASE: JSON.stringify(process.env.CDN_BASE),
      OPBEAT_APP_ID: JSON.stringify(process.env.OPBEAT_FRONTEND_APP_ID),
      OPBEAT_ORGANIZATION_ID: JSON.stringify(process.env.OPBEAT_ORGANIZATION_ID),
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        screw_ie8: true,
        warnings: false,
        dead_code: true,
        pure_funcs: ['A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', '_elm_lang$core$Native_Utils.update', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9'],
        passes: 2
      },
      mangle: {
        screw_ie8: true
      },
      output: {
        comments: false,
        screw_ie8: true
      }
    }),
    new ManifestPlugin(),
    new StringReplacePlugin(),
    new ExtractTextPlugin('[name].[chunkhash:8].css'),
  ]
}
