module.exports = async (webpackConfig) => {
  webpackConfig.module
    .rule('xml')
    .test(/\.xml$/i)
    .use('xml-loader')
    .loader(require.resolve('xml-loader'));
};
