module.exports = async (webpackConfig) => {
  // 空值属性判断
  if (!webpackConfig.module) webpackConfig.module = { rules: [] };

  // 添加 xml loader
  webpackConfig.module.rules.push({
    test: /\.xml$/i,
    use: require.resolve('xml-loader'),
  });
};
