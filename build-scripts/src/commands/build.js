const path = require('path');
const webpack = require('webpack');

module.exports = async () => {
  const rootDir = process.cwd();

  // 获取用户自定义配置
  const userConfig = require(path.resolve(rootDir, './build.json'));

  // 定义 webpack 配置
  const config = {
    entry: path.resolve(rootDir, userConfig.entry),
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
    console.log(stats?.toString());
    compiler.close((closeErr) => {});
  });
};
