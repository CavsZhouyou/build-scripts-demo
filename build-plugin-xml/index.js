module.exports = async ({ onGetWebpackConfig }) => {
  onGetWebpackConfig((webpackConfig) => {
    webpackConfig.module
      .rule('xml')
      .before('ts')
      .test(/\.xml$/i)
      .use('xml-loader')
      .loader(require.resolve('xml-loader'));
  });
};
