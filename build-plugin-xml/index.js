module.exports = async (webpack) => {
  // 添加 xml loader
  webpack.module.rules.push({
    test: /\.xml$/i,
    use: require.resolve('xml-loader'),
  });
};
