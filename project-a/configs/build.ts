const path = require('path');
const rootDir = process.cwd();

export default {
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
