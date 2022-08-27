const path = require('path');
const webpack = require('webpack');

// 定义 webpack 配置
const config = {
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, '../dist'),
  },
};

// 实例化 webpack
const compiler = webpack(config);

// 执行 webpack 编译
compiler.run((err, stats) => {
  compiler.close((closeErr) => {});
});
