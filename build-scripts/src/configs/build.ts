const path = require('path');
const rootDir = process.cwd();

const buildConfig = {
  entry: path.resolve(rootDir, './src/index'),
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

export default buildConfig;
