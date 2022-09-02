module.exports = (webpack, options) => {
  // 添加 xml loader
  webpack.module.rules.push([
    {
      test: /\.xml$/i,
      use: ['xml-loader'],
    },
  ]);
};
