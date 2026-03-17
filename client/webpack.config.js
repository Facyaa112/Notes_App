const path = require('path');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    // Точка входа
    entry: './src/index.js',
    
    // Выходной файл
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'public', 'js'),
      clean: true // Очищать папку перед каждой сборкой
    },
    
    // Режим сборки
    mode: isProduction ? 'production' : 'development',
    
    // Инструменты разработки
    devtool: isProduction ? 'source-map' : 'eval-source-map',
    
    // Модули и правила
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        }
      ]
    },
    
    // Оптимизация для production
    optimization: {
      minimize: isProduction,
      usedExports: true
    },
    
    // Для разработки с Webpack Dev Server
    devServer: {
      static: {
        directory: path.join(__dirname, 'public'),
      },
      compress: true,
      port: 8080,
      hot: true,
      proxy: [{
        context: ['/api'],
        target: 'http://localhost:3000'
      }]
    }
  };
};