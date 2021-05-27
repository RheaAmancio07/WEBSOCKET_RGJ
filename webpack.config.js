const glob = require('glob')
const path = require('path')
const htmlWebpackPlugin = require('html-webpack-plugin')
const extractTextWebpackPlugin = require('extract-text-webpack-plugin')
const purifyCSSPlugin = require('purifycss-webpack')
module.exports = {
  // mode: 'production',
  mode: 'development',
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: './assets/script/main.min.js',
    // publicPath: 'http://127.0.0.1:6788/dist' // Absolute path
  },
  module: {
    rules: [
      { // es6
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env']
          }
        },
        exclude: /node_modules/
      },
      { // Processing css introduced by js
        test: /\.css$/,
        use: extractTextWebpackPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader'
        })
        /*use: [
          {loader: 'style-loader'},
          {loader: 'css-loader' }
        ]*/
      },
      { // Picture path
        test: /\.(png|jpg|gif|jpeg)$/,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 800,  // Base64
            name: '/assets/images/[hash].[ext]'
          }
        }]
      },
      { // img tag path
        test: /\.(htm|html)$/i,
        use: ['html-withimg-loader']
      },
      { // sass compilation
        test: /\.sass$/,
        use: extractTextWebpackPlugin.extract({
          use: [
            {loader: 'css-loader'}, 
            {loader: 'sass-loader'}
          ],
          fallback: 'style-loader'
        })
      },
      /*{ // C3 plus prefix
        test: /\.css$/,
        use: extractTextWebpackPlugin.extract({
          use: [
            {loader: 'css-loader' },
            {loader: 'postcss-loader'}
          ],
          fallback: 'style-loader'
        })
      }*/
    ]
  },
  plugins: [
    // Compile html template
    new htmlWebpackPlugin({
      minify: {
        removeAttributeQuotes: true  // However, the double quotes around the attribute are dropped.
      },
      hash: true, // Mix into hash to avoid caching JS.
      inject: 'body', 
      template: './src/index.html', //stencil
      filename: './index.html'
    }),
    // css is separated into files independently
    new extractTextWebpackPlugin('./assets/style/style.css'),
    // Ignore invalid css
    new purifyCSSPlugin({
       paths: glob.sync(path.join(__dirname, 'src/*.html'))
    })
  ],
  devServer: {
    contentBase: path.resolve(__dirname, './dist'), // server directory
    host: '127.0.0.1',
    compress: true,  // server compression
    port: 8888,
    hot: true    // Hot reload
  }
}