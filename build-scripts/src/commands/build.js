const path = require('path');
const webpack = require('webpack');

module.exports = async () => {
  const rootDir = process.cwd();

  // 定义 webpack 配置
  const config = {
    entry: path.resolve(rootDir, './src/index.ts'),
    module: {
      rules: [
        {
          test: /\.ts?$/,
          use: require.resolve('ts-loader'),
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
    output: {
      filename: 'main.js',
      path: path.resolve(rootDir, './dist'),
    },
  };

  // 实例化 webpack
  const compiler = webpack(config);

  // 执行 webpack 编译
  compiler.run((err, stats) => {
    console.log('stats: ', stats?.toString());
    compiler.close((closeErr) => {});
  });
};
